package com.codestar.backend.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class InvitationCodeGenerator {

    private static final char[] ALPHABET ="ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int BLOCK_SIZE = 4;
    private static final int BLOCKS = 3;

    private final SecureRandom random = new SecureRandom();

    public String generate() {
        StringBuilder sb = new StringBuilder(BLOCK_SIZE * BLOCKS + (BLOCKS - 1));
        
        for (int b = 0; b < BLOCKS; b++) {
            if (b > 0) sb.append('-');

            for (int i = 0; i < BLOCK_SIZE; i++) {
                sb.append(ALPHABET[random.nextInt(ALPHABET.length)]);
            }
        }

        return sb.toString();
    }
}
