import * as vscode from 'vscode';
import { BuildNode } from './Client';

export class StatusBar {
  private statusBarItem: vscode.StatusBarItem;

  constructor(statusBarCommand: string) {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.statusBarItem.command = statusBarCommand;
  }

  get item() {
    return this.statusBarItem;
  }

  public updateItem(recentBuild: BuildNode) {
    let text: string;
    switch (recentBuild.status) {
      case 'queued':
          text = 'CircleCI Status: ${kebab-horizontal} QUEUED';
          break;
      case 'running':
        text = 'CircleCI Status: ${kebab-horizontal} RUNNING';
        break;
      case 'failed':
        text = 'CircleCI Status: $(stop) FAILED';
        break;
      case 'success':
          text = 'CircleCI Status: $(check) SUCCESS';
          break;
      case 'canceled':
          text = 'CircleCI Status: $(circle-slash) CANCELED';
          break;
      default:
        text = 'CircleCI Status: $(question) UNKNOWN';
        break;
    }

    this.statusBarItem.text = text;
    this.statusBarItem.show();
  }
}
