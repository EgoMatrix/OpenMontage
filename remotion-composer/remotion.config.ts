import { Config } from '@remotion/cli/config';

// OpenMontage: allow pointing Remotion at a pre-installed Chrome/Chromium so it
// does NOT download chrome-headless-shell from storage.googleapis.com (which is
// slow or blocked in some regions). Set the env var to your browser binary:
//
//   Linux:   export REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium
//            (or /usr/bin/chromium-browser, /usr/bin/google-chrome)
//   macOS:   export REMOTION_BROWSER_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
//
// When the env var is unset this file is a no-op and Remotion keeps its default
// download behavior — so it is safe to commit and merge.
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
if (browserExecutable) {
  Config.setBrowserExecutable(browserExecutable);
}
