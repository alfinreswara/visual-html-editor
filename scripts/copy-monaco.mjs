import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const source = path.join(process.cwd(), "node_modules", "monaco-editor", "min", "vs");
const destination = path.join(process.cwd(), "public", "monaco", "vs");

try {
  await rm(destination, { recursive: true, force: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
  console.log("Monaco assets disalin ke public/monaco/vs");
} catch (error) {
  console.warn("Gagal menyalin aset Monaco:", error instanceof Error ? error.message : error);
}
