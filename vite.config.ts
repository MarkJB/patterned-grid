import { defineConfig } from "vite";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserOrOrgPagesRepo = repositoryName.endsWith(".github.io");

const base = process.env.BASE_PATH
  ? process.env.BASE_PATH
  : process.env.GITHUB_ACTIONS
    ? isUserOrOrgPagesRepo
      ? "/"
      : `/${repositoryName}/`
    : "/";

export default defineConfig({
  base,
});
