import { ensureDir, exists, copy } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { copyIncludedPaths } from "./copyIncludedPaths.ts";

export default async function multiSourcePlugin(
  repos: { url: string; include: string[]; branch?: string }[],
  repoDir: string,
) {
  await ensureDir(repoDir);

  const combinedDir = join(repoDir, "../");

  // Clean out _combined while preserving the repoDir
  console.log("Cleaning out _combined directory...");
  for await (const entry of Deno.readDir(combinedDir)) {
    const entryPath = join(combinedDir, entry.name);
    if (entry.name !== repoDir.split("/").pop()) { // Skip repoDir
      console.log(`Removing ${entryPath}`);
      await Deno.remove(entryPath, { recursive: true });
    }
  }

  for (const repo of repos) {
    const url = new URL(repo.url);

    // Extract hostname, parent, and repository name
    const hostname = url.hostname; // e.g., github.com
    const parent = url.pathname.split("/")[1]; // Extract user or org name
    const repoName = url.pathname.split("/")[2].replace(".git", ""); // Extract repository name

    // Determine branch
    let branch = repo.branch;
    if (!branch) {
      console.log(`Determining default branch for ${repo.url}...`);
      try {
        const remoteInfo = await new Deno.Command("/usr/bin/git", {
          args: ["ls-remote", "--symref", repo.url, "HEAD"],
        }).output();
        const remoteOutput = new TextDecoder().decode(remoteInfo.stdout);

        // Match only the branch name in "ref: refs/heads/<branch>"
        const branchMatch = remoteOutput.match(/ref: refs\/heads\/([^\t\n]+)/);
        branch = branchMatch ? branchMatch[1].trim() : "main"; // Default to "main" if not found
        console.log(`Default branch determined: ${branch}`);
      } catch (err) {
        console.error(`Failed to determine default branch for ${repo.url}:`, err);
        branch = "main"; // Default fallback
      }
    }

    // Construct localRepoPath with hostname, parent, repoName, and branch
    const localRepoPath = join(repoDir, `${hostname}/${parent}/${repoName}.${branch}`);
    await ensureDir(localRepoPath);

    // Check if the repository is initialized
    if (await exists(join(localRepoPath, ".git"))) {
      console.log(`Repository already exists at ${localRepoPath}. Pulling latest changes...`);
      try {
        await new Deno.Command("/usr/bin/git", {
          args: ["pull", "origin", branch],
          cwd: localRepoPath,
        }).output();
        console.log("Pull successful.");
      } catch (err) {
        console.error(`Failed to pull latest changes for ${repo.url}:`, err);
      }
    } else {
      console.log(`Initializing repository at ${localRepoPath}`);
      try {
        await new Deno.Command("/usr/bin/git", { args: ["init"], cwd: localRepoPath }).output();
        console.log("Git repository initialized.");

        console.log(`Adding remote origin: ${repo.url}`);
        await new Deno.Command("/usr/bin/git", {
          args: ["remote", "add", "origin", repo.url],
          cwd: localRepoPath,
        }).output();

        console.log("Configuring sparse-checkout...");
        await new Deno.Command("/usr/bin/git", {
          args: ["config", "core.sparseCheckout", "true"],
          cwd: localRepoPath,
        }).output();

        console.log("Setting sparse-checkout paths...");
        await new Deno.Command("/usr/bin/git", {
          args: ["sparse-checkout", "set", ...repo.include],
          cwd: localRepoPath,
        }).output();

        console.log(`Fetching branch '${branch}'...`);
        await new Deno.Command("/usr/bin/git", {
          args: ["fetch", "--depth", "1", "origin", branch],
          cwd: localRepoPath,
        }).output();

        console.log(`Checking out branch '${branch}'...`);
        await new Deno.Command("/usr/bin/git", { args: ["checkout", branch], cwd: localRepoPath }).output();
      } catch (err) {
        console.error(`Failed to initialize or fetch repository ${repo.url}:`, err);
        continue;
      }
    }

    // Copy included paths into _combined
    await copyIncludedPaths(localRepoPath, repo.include, combinedDir);
  }
}
