import fs from "fs";
import Bun from "bun";
import c from "./constants";

export async function cleanup() {
  fs.rmdirSync(c.installDir, {
    recursive: true,
    maxRetries: 30,
    retryDelay: 100,
  });
}

export default cleanup;
