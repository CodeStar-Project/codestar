/**
 * Enables type-safe translations using `en.json` as the reference.
 * Provides autocompletion and build-time validation for translation keys.
 */
import type messages from "./messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages;
  }
}
