import { Config, PrConfig } from "./types";
import { getInput, InputOptions } from "@actions/core";
import { context } from "@actions/github";

export function getConfig(): Config {
  return {
    headToMerge: getInput("sha_to_merge") || context.sha,
    targetBranch: getInput("target_branch", { required: true }),
    repoToken: getInput("repo_token", { required: true }),
    repoName: context.repo.repo,
    repoOwner: context.repo.owner,
    prConfig: getPrConfig(),
  };
}

function getPrConfig(): PrConfig {
  return {
    mergeBranchName: getInput("merge_branch_name", { required: true }).replace(
      "refs/heads/",
      ""
    ),
    title: getInput("pr_title", { required: true }),
    body: getInput("pr_body"),
    maintainerCanModify: getBool("pr_maintainer_modification"),
    isDraft: getBool("pr_draft"),
    assignedUser: getInput("pr_asignee"),
    reviewer: getInput("pr_reviewer"),
  };
}

function getBool(
  key: string,
  options: InputOptions | undefined = undefined
): boolean {
  const value = getInput(key, options);
  return /^\s*(true|1)\s*$/i.test(value);
}
