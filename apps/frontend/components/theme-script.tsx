/**
 * Inline blocking script — runs before paint to correct the `system` theme.
 *
 * The server already sets <html data-theme> from the cookie (default = dark).
 * When the cookie is "system", the server cannot know the OS preference, so
 * this script reads `matchMedia` synchronously and fixes data-theme before the
 * first paint → no flash of the wrong theme (FOUC).
 */

import { THEME_COOKIE } from "@/lib/theme";

export function ThemeScript() {
  const js = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);var v=m?decodeURIComponent(m[1]):null;if(v==="system"||!v&&false){var d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light";}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
