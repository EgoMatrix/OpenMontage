import { Config } from '@remotion/cli/config';
import { existsSync } from 'node:fs';

// OpenMontage: use a pre-installed Chrome/Chromium so Remotion does NOT download
// chrome-headless-shell from storage.googleapis.com (slow/blocked in some regions).
//
// Resolution order:
//   1. REMOTION_BROWSER_EXECUTABLE env var, if set and pointing at a real file.
//   2. Auto-detect a browser at the common install locations below.
//   3. If neither is found, this file is a no-op and Remotion keeps its default
//      download behavior — so it is safe to commit and merge.
//
// After `dnf/apt install chromium` (or google-chrome), `npx remotion render`
// just works with no env setup required.
const CANDIDATE_PATHS = [
  // Linux — distro chromium / google-chrome
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/lib64/chromium-browser/chromium-browser',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/opt/google/chrome/chrome',
  '/snap/bin/chromium',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

const fromEnv = process.env.REMOTION_BROWSER_EXECUTABLE;
const resolved =
  fromEnv && existsSync(fromEnv)
    ? fromEnv
    : CANDIDATE_PATHS.find((p) => existsSync(p));

if (resolved) {
  console.log(`[remotion.config] using system browser: ${resolved}`);
  Config.setBrowserExecutable(resolved);
} else {
  console.warn(
    '[remotion.config] no system Chrome/Chromium found; Remotion will download chrome-headless-shell. ' +
      'Install one (e.g. `dnf install chromium`) or set REMOTION_BROWSER_EXECUTABLE.',
  );
}
