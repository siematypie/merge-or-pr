export interface PrConfig {
  title: string;
  body: string;
  isDraft: boolean;
  maintainerCanModify: boolean;
  assignedUser: string;
  reviewer: string;
  mergeBranchName: string;
}

export interface Config {
  repoName: string;
  repoOwner: string;
  headToMerge: string;
  targetBranch: string;
  repoToken: string;
  prConfig: PrConfig;
}
