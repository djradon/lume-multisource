import { ensureDir } from "https://deno.land/std/fs/mod.ts";
import { resolve, join } from "https://deno.land/std/path/mod.ts";

/**
 * Tidies up the combined directory by clearing its contents while preserving specified subdirectories.
 * @param {string} combinedDir - Path to the combined directory.
 * @param {string[]} [preserveDirs] - List of subdirectories to preserve. Optional.
 */
export async function tidyCombinedDir(combinedDir: string, preserveDirs?: string[]) {
  console.log(`Tidying up ${combinedDir}...`);

  // Ensure the combined directory exists
  await ensureDir(combinedDir);

  // Resolve the full paths of preserved directories for comparison
  const resolvedCombinedDir = resolve(combinedDir);
  const resolvedPreserveDirs = (preserveDirs || []).map((dir) => resolve(dir));

  // Iterate through the contents of the combined directory
  for await (const entry of Deno.readDir(resolvedCombinedDir)) {
    const entryPath = join(resolvedCombinedDir, entry.name);

    // Check if the entry is in the preserved directories list
    if (resolvedPreserveDirs.includes(entryPath)) {
      console.log(`Preserving ${entryPath}`);
      continue;
    }

    // Remove the entry
    console.log(`Deleting ${entryPath}`);
    await Deno.remove(entryPath, { recursive: true });
  }

  console.log(`Tidied up ${combinedDir}`);
}
