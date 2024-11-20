import { copy } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

/**
 * Copies included paths from the source repository to the combined directory.
 * Applies inclusion and exclusion rules during the copying process.
 *
 * @param {string} sourceDir - Path to the source directory (e.g., repository root).
 * @param {string} targetDir - Path to the target combined directory.
 * @param {object} options - Inclusion and exclusion options.
 * @param {string[]} [options.include] - Paths to explicitly include.
 * @param {string[]} [options.exclude] - Paths to explicitly exclude.
 * @param {boolean} [options.excludeByDefault=false] - If true, exclude everything by default unless explicitly included.
 */
export async function copyIncludedPaths(
  sourceDir: string,
  targetDir: string,
  options: { include?: string[]; exclude?: string[]; excludeByDefault?: boolean } = {}
) {
  const { include, exclude, excludeByDefault } = options;

  let pathsToCopy: string[];

  /*
    Logic Summary:
    1. If include is specified:
       - Include only those paths explicitly listed, excluding any paths listed in exclude.
    2. If include is not specified:
       - If excludeByDefault is true: include nothing (exclude everything).
       - If excludeByDefault is false: include everything (*), excluding any paths listed in exclude.
  */
  if (include) {
    // Explicit includes are provided; filter out explicitly excluded paths
    pathsToCopy = include.filter((item) => !(exclude || []).includes(item));
  } else if (excludeByDefault) {
    // No explicit includes and excludeByDefault is true; include nothing
    pathsToCopy = [];
  } else {
    // No explicit includes and excludeByDefault is false; include everything except explicitly excluded paths
    pathsToCopy = ["*"].filter((item) => !(exclude || []).includes(item));
  }

  // Perform the copying
  for (const path of pathsToCopy) {
    const sourcePath = join(sourceDir, path);
    const targetPath = join(targetDir, path);

    console.log(`Copying ${sourcePath} to ${targetPath}`);
    try {
      await copy(sourcePath, targetPath, { overwrite: true });
    } catch (err) {
      console.error(`Failed to copy ${path}:`, err);
    }
  }

  console.log(`Completed copying paths to ${targetDir}`);
}
