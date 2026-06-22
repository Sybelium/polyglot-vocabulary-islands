import fs from "fs/promises";
import path from "path";

export async function getA0IslandData(islandId) {
  const safeIslandId = islandId.replace(/[^a-z0-9-]/gi, "");

  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "journeys",
    "a0",
    `${safeIslandId}.json`
  );

  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
}