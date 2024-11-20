export const multisourceConfig = {
  global: {
    repoDir: "_combined/_source-repos", // Directory for cloned repositories, relative to Lume's _config.ts
    combinedDir: "_combined", // Directory for combined output, relative to Lume's _config.ts
  },
  inclusions: [
    {
      url: "git@github.com:djradon/lumenous-template.git",
      options: {
        include: ["demo", "lumenous-template"],
        exclude: [],
        excludeByDefault: false,
        autoPullBeforeBuild: false,
        autoPushBeforeBuild: false,
      },
    }/*,
    {
      url: "https://github.com/another-repo/example.git",
      options: {
        include: ["src", "docs"],
        exclude: ["tests"],
        excludeByDefault: false,
        autoPullBeforeBuild: true,
      },
    },*/
  ],
};
