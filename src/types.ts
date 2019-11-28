import * as vscode from 'vscode';

export interface RecentBuild {
  status: string;
  buildUrl: string;
  buildNum: number;
  subject: string;
  branch: string;
  committerName: string;
  workflowName: string;
  jobName: string;
  usageQueuedAt: string;  
}

export interface BuildListQuickPickItem extends vscode.QuickPickItem {
  buildUrl: string;
}
