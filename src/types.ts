import * as vscode from 'vscode';

export interface RecentBuild {
  status: 'queued' | 'running' | 'failed' | 'success' | 'canceled';
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
