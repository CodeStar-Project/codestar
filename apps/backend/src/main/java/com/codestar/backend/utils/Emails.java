package com.codestar.backend.utils;

import java.util.Locale;

public final class Emails {

    private Emails() {}

    public static String normalize(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
