import zz from "./baseUZipper";
import c from "./constants";

import postExtract from "./postExtract";

declare global {
  interface String {
    format(...args: string[]): string;
  }
}

String.prototype.format = function (...args: string[]): string {
  return this.replace(
    /{(\d+)}/g,
    (match: string, num: number): string => args[num]
  );
};

if (c.args.length === 0) {
  console.log("No arguments provided");
  process.exit(1);
}

c.installDir = c.tempDir + c.runID + c.sep;

zz.unpack(c.args[0], c.installDir, (err) => {
  if (err) {
    throw err;
  }

  postExtract();
});
