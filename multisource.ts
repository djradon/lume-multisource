import { resolve } from "https://deno.land/std/path/mod.ts";
import { multisourceConfig } from "./_multisourceConfig.ts";
import { tidyCombinedDir } from "./tidyCombinedDir.ts";
import { prepareInclusions } from "./prepareInclusions.ts";

export default async function multisource(lumeBasePath: string) {
  const { global, inclusions } = multisourceConfig;

  // Resolve global directories
  const combinedDir = resolve(lumeBasePath, global.combinedDir);
  const repoDir = resolve(lumeBasePath, global.repoDir);

  // Preserve the repoDir only if it's a subdirectory of combinedDir
  const preserveDirs = repoDir.startsWith(combinedDir) ? [repoDir] : [];

  // Clean up the combined directory
  await tidyCombinedDir(combinedDir, preserveDirs);

  // Prepare inclusions
  await prepareInclusions(repoDir, combinedDir, inclusions);
}
