package com.codestar.backend.service;

import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.MediaAsset;
import com.codestar.backend.repository.IMediaAssetRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Filesystem-backed media storage (course images)
 */
@Service
public class MediaStorageService {

    private static final Logger log = LoggerFactory.getLogger(MediaStorageService.class);

    // Extension → content-type for serving. SVG excluded (script/XSS vector).
    private static final Map<String, String> EXT_CONTENT_TYPE = Map.of(
            "png", "image/png",
            "jpg", "image/jpeg",
            "webp", "image/webp",
            "gif", "image/gif"
    );
    private static final long MAX_BYTES = 5L * 1024 * 1024; // 5 MB
    private static final long MAX_PIXELS = 50L * 1_000_000; // 50 MP decoded
    private static final int MAX_DIM = 12_000; // px per side
    private static final Pattern ID_PATTERN = Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[a-z0-9]+$");

    private final IMediaAssetRepository mediaAssets;
    private final UploadRateLimiter rateLimiter;
    private final String storagePathRaw;
    private final long userQuotaBytes;
    private final long instanceQuotaBytes;
    private final long userQuotaMb;
    private final long instanceQuotaMb;

    private Path storageRoot;

    public MediaStorageService(IMediaAssetRepository mediaAssets, UploadRateLimiter rateLimiter, @Value("${codestar.media.storage-path:./media}") String storagePathRaw, @Value("${codestar.media.user-quota-mb:100}") long userQuotaMb, @Value("${codestar.media.instance-quota-mb:5000}") long instanceQuotaMb) {
        this.mediaAssets = mediaAssets;
        this.rateLimiter = rateLimiter;
        this.storagePathRaw = storagePathRaw;
        this.userQuotaMb = userQuotaMb;
        this.instanceQuotaMb = instanceQuotaMb;
        this.userQuotaBytes = userQuotaMb * 1024L * 1024L;
        this.instanceQuotaBytes = instanceQuotaMb * 1024L * 1024L;
    }

    @PostConstruct
    void init() {
        storageRoot = Path.of(storagePathRaw).toAbsolutePath().normalize();
        try {
            Files.createDirectories(storageRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create media storage dir: " + storageRoot, e);
        }
    }

    public String store(MultipartFile file, UUID ownerId) {
        if (!rateLimiter.tryAcquire(ownerId)) {
            throw ApiException.tooManyRequests("too many uploads, please slow down");
        }
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("file is required");
        }
        if (file.getSize() > MAX_BYTES) {
            throw ApiException.badRequest("file exceeds the 5 MB limit");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw ApiException.badRequest("could not read file");
        }
        // getSize() can be spoofed/streamed so we re-check against the real buffer.
        if (bytes.length > MAX_BYTES) {
            throw ApiException.badRequest("file exceeds the 5 MB limit");
        }

        String ext = detectType(bytes);
        if (ext == null) {
            throw ApiException.badRequest("unsupported image type (png, jpg, webp, gif only)");
        }
        int[] dim = readDimensions(bytes); // bomb guard; null when unknown (e.g. webp)

        long newBytes = bytes.length;
        enforceQuota(ownerId, newBytes);

        String id = UUID.randomUUID() + "." + ext;
        Path target = pathFor(id);
        if (!target.startsWith(storageRoot)) {
            throw ApiException.badRequest("invalid target path");
        }
        writeAtomic(target, bytes);

        try {
            mediaAssets.save(new MediaAsset(
                    id, ownerId, contentTypeFor(id), newBytes,
                    dim == null ? null : dim[0],
                    dim == null ? null : dim[1]));
        } catch (RuntimeException e) {
            try {
                Files.deleteIfExists(target);
            } catch (IOException ignored) {
                // best-effort
            }
            throw e;
        }
        return id;
    }

    public Resource load(String id) {
        if (id == null || !ID_PATTERN.matcher(id).matches()) {
            throw ApiException.notFound("Media not found");
        }
        Path file = pathFor(id);
        if (!file.startsWith(storageRoot) || !Files.isReadable(file)) {
            throw ApiException.notFound("Media not found");
        }
        return new FileSystemResource(file);
    }

    public String contentTypeFor(String id) {
        int dot = id.lastIndexOf('.');
        String ext = dot >= 0 ? id.substring(dot + 1).toLowerCase() : "";
        return EXT_CONTENT_TYPE.getOrDefault(ext, "application/octet-stream");
    }

    private Path pathFor(String id) {
        return storageRoot
                .resolve(id.substring(0, 2))
                .resolve(id.substring(2, 4))
                .resolve(id)
                .normalize();
    }

    // Rejects when the upload would push the owner or the instance over quota.
    private void enforceQuota(UUID ownerId, long newBytes) {
        if (mediaAssets.sumBytesByOwner(ownerId) + newBytes > userQuotaBytes) {
            throw ApiException.payloadTooLarge("upload would exceed your storage quota (" + userQuotaMb + " MB)");
        }
        if (mediaAssets.sumBytesTotal() + newBytes > instanceQuotaBytes) {
            throw ApiException.payloadTooLarge("instance storage is full (" + instanceQuotaMb + " MB)");
        }
    }

    private static String detectType(byte[] b) {
        if (b.length >= 8
                && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
                && (b[4] & 0xFF) == 0x0D && (b[5] & 0xFF) == 0x0A
                && (b[6] & 0xFF) == 0x1A && (b[7] & 0xFF) == 0x0A) {
            return "png";
        }
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (b.length >= 6
                && b[0] == 'G' && b[1] == 'I' && b[2] == 'F' && b[3] == '8'
                && (b[4] == '7' || b[4] == '9') && b[5] == 'a') {
            return "gif";
        }
        if (b.length >= 12
                && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "webp";
        }
        return null;
    }

    private int[] readDimensions(byte[] bytes) {
        try (ImageInputStream iis = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (iis == null) {
                return null;
            }
            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            if (!readers.hasNext()) {
                return null;
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(iis, true, true);
                int w = reader.getWidth(0);
                int h = reader.getHeight(0);
                if (w <= 0 || h <= 0 || w > MAX_DIM || h > MAX_DIM || (long) w * h > MAX_PIXELS) {
                    throw ApiException.badRequest("image dimensions too large");
                }
                return new int[]{w, h};
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            throw ApiException.badRequest("could not read image");
        }
    }

    // Writes to a temp file then atomically moves it into place
    private void writeAtomic(Path target, byte[] bytes) {
        Path tmp = null;
        try {
            Path dir = target.getParent();
            Files.createDirectories(dir);
            tmp = Files.createTempFile(dir, "upload-", ".tmp");
            Files.write(tmp, bytes);
            try {
                Files.move(tmp, target, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException e) {
                Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING);
            }
            tmp = null;
        } catch (IOException e) {
            log.error("Failed to store media at {}: {}", target, e.getMessage());
            throw ApiException.badRequest("could not store file");
        } finally {
            if (tmp != null) {
                try {
                    Files.deleteIfExists(tmp);
                } catch (IOException ignored) {
                    // best-effort temp cleanup
                }
            }
        }
    }
}
