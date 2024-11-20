import { ensureDir, emptyDir } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

/**
 * Tidies up the _combined directory by clearing files but retaining specific subdirectories.
 * @param {string} combinedDir - Path to the _combined directory.
 * @param {string[]} preserveDirs - List of subdirectories to preserve within _combined.
 */
export async function tidyCombinedDir(combinedDir: string, preserveDirs: string[] = ["_src-repos"]) {
  console.log(`Tidying up ${combinedDir}...`);

  // Ensure the _combined directory exists
  await ensureDir(combinedDir);

  // Iterate over subdirectories to preserve them
  for (const subDir of preserveDirs) {
    const preservePath = join(combinedDir, subDir);
    await ensureDir(preservePath);
  }

  // Clear everything in _combined
  await emptyDir(combinedDir);

  // Recreate the preserved subdirectories
  for (const subDir of preserveDirs) {
    const preservePath = join(combinedDir, subDir);
    await ensureDir(preservePath);
  }

  console.log(`${combinedDir} tidied up, preserving: ${preserveDirs.join(", ")}`);
}
