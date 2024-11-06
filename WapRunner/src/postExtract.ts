import fs from "fs";
import c from "./constants";
import os from "os";
import { spawn } from "child_process";
import cleanup from "./cleanup";

export function postExtract() {
  process.stdin.setRawMode(true);
  if (!fs.existsSync(c.installDir + "manifest.json")) {
    console.log("No manifest file found");
    process.exit(1);
  }
  c.manifest = JSON.parse(
    fs.readFileSync(c.installDir + "manifest.json", "utf8")
  );

  if (!(c.manifest as any).appID) {
    throw new Error("No appID found in manifest");
  }

  c.symDataDir =
    c.persistDir + (c.manifest as any).appID.split(".").join(c.sep) + c.sep;

  if ((c.manifest as any).persist) {
    for (let i = 0; i < (c.manifest as any).persist.length; i++) {
      const element = (c.manifest as any).persist[i];

      if (!fs.existsSync(c.symDataDir + element + c.sep)) {
        console.log("Creating directory: " + c.symDataDir + element + c.sep);
        fs.mkdirSync(c.symDataDir + element + c.sep, { recursive: true });
      }

      fs.symlinkSync(
        c.persistDir + element + c.sep,
        c.installDir + element + c.sep,
        "dir"
      );
    }
  }

  const manifest = c.manifest as any;
  if (!manifest.app) {
    throw new Error("No app found in manifest");
  }
  if (!manifest.app[os.type()]) {
    throw new Error(`App doesn't support ${os.type()} OS`);
  }
  if (!manifest.app[os.type()][os.arch()]) {
    throw new Error(`App doesn't support ${os.arch()} architecture`);
  }
  if (!manifest.app[os.type()][os.arch()].exe) {
    throw new Error("No executable found in manifest");
  }

  const app = spawn(
    c.installDir + manifest.app[os.type()][os.arch()].exe,
    c.args.slice(1)
  );

  app.stdout.on("data", (data) => {
    process.stdout.write(data.toString());
  });

  app.stderr.on("data", (data: any) => {
    process.stderr.write(data.toString());
  });

  process.stdin.on("data", (data) => {
    if (data.toString() === "\u0003") {
      app.kill();
    }
    if (data.toString() === "\u0004") {
      app.kill();
    }
    if (data.toString() === "\b") {
      process.stdout.write("\b ");
    }
    if (data.toString() === "\r") {
      process.stdout.write("\n");
      app.stdin.write("\n");
    }
    process.stdout.write(data.toString());
    app.stdin.write(data);
  });

  let handleExit = async () => {
    app.kill();
    while (!app.killed) {
      app.kill();
    }
    await cleanup();
  };

  let handleErroredExit = async () => {
    process.stdin.resume();
    app.kill();
    while (!app.killed) {
      app.kill();
    }
    await cleanup();
  };

  app.on("close", async (code) => {
    app.kill();
    while (!app.killed) {
      app.kill();
    }
    process.exit(code);
  });

  app.on("exit", async (code) => {
    app.kill();
    while (!app.killed) {
      app.kill();
    }
    process.exit(code);
  });

  process.on("exit", handleExit);

  process.on("SIGINT", handleErroredExit);
  process.on("SIGTERM", handleErroredExit);
  process.on("SIGQUIT", handleErroredExit);
}

export default postExtract;
