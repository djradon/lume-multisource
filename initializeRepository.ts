/**
 * Initializes and fetches a Git repository.
 * @param {string} localRepoPath - Path to the local repository.
 * @param {string} repoUrl - URL of the remote repository.
 * @param {string} branch - Branch to fetch and checkout.
 * @param {string[]} includePaths - Paths to include in sparse-checkout.
 */
export async function initializeRepository(localRepoPath: string, repoUrl: string, branch: string, includePaths: string[]) {
  console.log(`Initializing repository at ${localRepoPath}`);
  try {
    // Initialize the Git repository
    await new Deno.Command("/usr/bin/git", {
      args: ["init"],
      cwd: localRepoPath,
    }).output();
    console.log("Git repository initialized.");

    // Add the remote origin
    console.log(`Adding remote origin: ${repoUrl}`);
    await new Deno.Command("/usr/bin/git", {
      args: ["remote", "add", "origin", repoUrl],
      cwd: localRepoPath,
    }).output();

    // Configure sparse-checkout
    console.log("Configuring sparse-checkout...");
    await new Deno.Command("/usr/bin/git", {
      args: ["config", "core.sparseCheckout", "true"],
      cwd: localRepoPath,
    }).output();

    // Set sparse-checkout paths
    console.log("Setting sparse-checkout paths...");
    await new Deno.Command("/usr/bin/git", {
      args: ["sparse-checkout", "set", ...includePaths],
      cwd: localRepoPath,
    }).output();

    // Fetch the specified branch
    console.log(`Fetching branch '${branch}'...`);
    await new Deno.Command("/usr/bin/git", {
      args: ["fetch", "--depth", "1", "origin", branch],
      cwd: localRepoPath,
    }).output();

    // Checkout the branch
    console.log(`Checking out branch '${branch}'...`);
    await new Deno.Command("/usr/bin/git", {
      args: ["checkout", branch],
      cwd: localRepoPath,
    }).output();

    console.log(`Repository ${repoUrl} successfully initialized and fetched.`);
  } catch (err) {
    console.error(`Failed to initialize or fetch repository ${repoUrl}:`, err);
    throw err; // Re-throw to propagate failure if needed
  }
}
