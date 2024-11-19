import { exists, copy } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

/**
 * Copies included paths from a source repository to the target directory.
 *
 * @param {string} localRepoPath - The path to the local repository.
 * @param {string[]} include - List of folders/files to include.
 * @param {string} combinedDir - The target directory for combined content.
 */
export async function copyIncludedPaths(localRepoPath: string, include: string[], combinedDir: string) {
  for (const includePath of include) {
    const sourcePath = join(localRepoPath, includePath);
    const targetPath = join(combinedDir); // Root of combined directory

    if (await exists(sourcePath)) {
      for await (const entry of Deno.readDir(sourcePath)) {
        const sourceEntryPath = join(sourcePath, entry.name);
        const targetEntryPath = join(targetPath, entry.name);

        console.log(`Copying ${sourceEntryPath} to ${targetEntryPath}`);
        await copy(sourceEntryPath, targetEntryPath, { overwrite: true });
      }
    } else {
      console.warn(`Warning: ${sourcePath} does not exist.`);
    }
  }
}
