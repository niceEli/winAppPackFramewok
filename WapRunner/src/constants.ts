import { sep } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

export let c = {
  tempDir: tmpdir() + sep + "wapApps" + sep,
  persistDir:
    ((process.env as any).APPDATA ||
      (process.platform == "darwin"
        ? process.env.HOME + "/Library/Preferences"
        : (process.env as any).HOME + "/.local/share")) + sep,
  args: process.argv.slice(2),
  runID: randomUUID(),
  installDir: "",
  symDataDir: "",
  sep: sep,
  manifest: new Object(),
};

export default c;
