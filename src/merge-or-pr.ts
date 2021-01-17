import { setOutput } from "@actions/core";
import { getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import { Config } from "./types";

export async function mergeOrPr(config: Config) {
  const octokit = getOctokit(config.repoToken);
  if (!(await tryMerge(octokit, config))) {
    await createPr(octokit, config);
  }
}

async function tryMerge(
  octokit: InstanceType<typeof GitHub>,
  {
    repoName: repo,
    repoOwner: owner,
    targetBranch: base,
    headToMerge: head,
  }: Config
): Promise<boolean> {
  try {
    await octokit.repos.merge({
      repo,
      owner,
      base,
      head,
    });
    setOutput("PR_CREATED", false);
    return true;
  } catch (error) {
    if (error.name !== "HttpError" || error.status !== 409) {
      throw Error(error);
    }
    return false;
  }
}

async function createPr(octokit: InstanceType<typeof GitHub>, config: Config) {
  const branchRef = `refs/heads/${config.prConfig.mergeBranchName}`;
  const prConfig = config.prConfig;
  await octokit.git.createRef({
    repo: config.repoName,
    owner: config.repoOwner,
    sha: config.headToMerge,
    ref: branchRef,
  });
  const pr = await octokit.pulls.create({
    repo: config.repoName,
    owner: config.repoOwner,
    head: branchRef,
    title: prConfig.title,
    body: prConfig.body,
    draft: prConfig.isDraft,
    maintainer_can_modify: prConfig.maintainerCanModify,
    base: config.targetBranch,
  });
  const assignedUser = prConfig.assignedUser;
  if (assignedUser) {
    await octokit.issues.addAssignees({
      repo: config.repoName,
      owner: config.repoOwner,
      issue_number: pr.data.number,
      assignees: [assignedUser],
    });
  }
  const reviewer = prConfig.reviewer;
  if (reviewer) {
    await octokit.pulls.requestReviewers({
      repo: config.repoName,
      owner: config.repoOwner,
      pull_number: pr.data.number,
      reviewers: [reviewer],
    });
  }
  setOutput("PR_CREATED", true);
  setOutput("PR_NUMBER", pr.data.number);
  setOutput("PR_URL", pr.data.html_url);
  setOutput("MERGE_BRANCH_NAME", config.prConfig.mergeBranchName);
}
