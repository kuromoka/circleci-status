import * as vscode from 'vscode';
import { BuildNode } from './apiClient';

export class BuildStatusBar {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  }

  get item() {
    return this.statusBarItem;
  }

  public updateItem(recentBuild: BuildNode) {
    let text: string;
    switch (recentBuild.status) {
      case 'success':
        text = 'success!';
        break;
      case 'running':
        text = 'running';
        break;
      case 'failed':
        text = 'failed';
        break;
      default:
        text = 'unknown';
        break;
    }

    this.statusBarItem.text = text;
    this.statusBarItem.show();
  }
}
