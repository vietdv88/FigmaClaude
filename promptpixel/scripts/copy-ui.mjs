import { copyFile, mkdir } from "node:fs/promises";

const outputDirectory = new URL("../dist/", import.meta.url);
await mkdir(outputDirectory, { recursive: true });
await copyFile(
  new URL("../src/ui.html", import.meta.url),
  new URL("ui.html", outputDirectory)
);

