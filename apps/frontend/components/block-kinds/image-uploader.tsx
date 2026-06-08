"use client";

import { useRef, useState, useTransition } from "react";

import { uploadMedia } from "@/app/actions/media";
import { GlassButton } from "@/components/ui/glass-button";
import { UploadIcon } from "@/components/ui/icons";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

/** Client island: pick a file → upload → hand back the served URL. */
export function ImageUploader({
  onUploaded,
  label,
  errorLabel,
}: {
  onUploaded: (url: string) => void;
  label: string;
  errorLabel: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    start(async () => {
      const r = await uploadMedia(fd);
      if (!r.ok || !r.url) {
        setError(r.error ?? errorLabel);
        return;
      }
      onUploaded(r.url);
    });
  }

  return (
    <div className="space-y-1">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={onFile}
      />
      <GlassButton
        type="button"
        variant="glass"
        size="sm"
        onClick={() => fileRef.current?.click()}
        loading={uploading}
        className="w-full"
      >
        <UploadIcon size={14} />
        {label}
      </GlassButton>
      {error && (
        <p className="text-[0.78rem] text-[color:var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
