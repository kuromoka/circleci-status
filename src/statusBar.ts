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
