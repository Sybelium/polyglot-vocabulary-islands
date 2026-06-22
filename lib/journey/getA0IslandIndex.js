import fs from "fs/promises";
import path from "path";

export async function getA0IslandIndex() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "journeys",
    "a0",
    "a0-index.json"
  );

  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
}