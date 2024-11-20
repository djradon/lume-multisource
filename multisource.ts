import { ensureDir, exists } from "https://deno.land/std/fs/mod.ts";
import { join, resolve } from "https://deno.land/std/path/mod.ts";
import { multisourceConfig } from "./_multisourceConfig.ts";
import { tidyCombinedDir } from "./tidyCombinedDir.ts";
import { determineBranch } from "./determineBranch.ts";
import { copyIncludedPaths } from "./copyIncludedPaths.ts";
import { initializeRepository } from "./initializeRepository.ts";

export default async function multisource() {
  const { global, inclusions } = multisourceConfig;
  const lumeDir = resolve("lume");
  const repoDir = join(lumeDir, global.repoDir);
  const combinedDir = join(lumeDir, global.combinedDir);

  // Tidy up the _combined directory
  await tidyCombinedDir(combinedDir, ["_src-repos"]);

  // Ensure the repoDir exists
  await ensureDir(repoDir);

  for (const { url, options } of inclusions) {
    const urlForParsing = url.startsWith("git@")
      ? new URL(`https://${url.replace("git@", "").replace(":", "/")}`)
      : new URL(url);

    const hostname = urlForParsing.hostname;
    const parent = urlForParsing.pathname.split("/")[1];
    const repoName = urlForParsing.pathname.split("/")[2].replace(".git", "");
    const branch = await determineBranch(url, "main");

    // Construct localRepoPath with hostname, parent, repoName, and branch
    const localRepoPath = join(repoDir, `${hostname}/${parent}/${repoName}.${branch}`);
    await ensureDir(localRepoPath);

    // Check if the repository is initialized
    if (await exists(join(localRepoPath, ".git"))) {
      console.log(`Repository already exists at ${localRepoPath}.`);

      if (options?.autoPullBeforeBuild) {
        console.log(`Pulling latest changes for ${url}...`);
        try {
          await new Deno.Command("/usr/bin/git", {
            args: ["pull", "origin", branch],
            cwd: localRepoPath,
          }).output();
        } catch (err) {
          console.error(`Failed to pull latest changes for ${url}:`, err);
        }
      }
    } else {
      try {
        await initializeRepository(localRepoPath, url, branch, options.include || []);
      } catch (err) {
        console.error(`Error during repository setup: ${url}`, err);
        continue;
      }
    }

    // Copy included paths with exclusion and inclusion logic centralized
    await copyIncludedPaths(localRepoPath, combinedDir, options);
  }
}
