import * as vscode from 'vscode';
import * as Types from './types';
import { ApiClient } from './ApiClient';
import { QuickPick } from './QuickPick';

export class StatusBar {
  static readonly COMMAND_NAME: string = 'circleciStatus.selectCommand';

  private apiClient: ApiClient;
  private quickPick: QuickPick;
  private statusBarItem: vscode.StatusBarItem;

  constructor(context: vscode.ExtensionContext, apiClient: ApiClient, quickPick: QuickPick) {
    this.apiClient = apiClient;
    this.quickPick = quickPick;
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

    context.subscriptions.push(vscode.commands.registerCommand(StatusBar.COMMAND_NAME, () => {
      this.quickPick.showItem(this);
    }));

    this.statusBarItem.command = StatusBar.COMMAND_NAME;
    context.subscriptions.push(this.statusBarItem);
  }

  public setup(): Promise<any> {
    const self = this;
    setInterval(() => {
      self.updateBuildStatus();
    }, 60000);

    return this.updateBuildStatus();
  }

  public updateBuildStatus(): Promise<any> {
    return this.apiClient.getRecentBuilds()
      .then((recentBuilds: Types.RecentBuild[]) => {
        this.updateItem(recentBuilds[0]);
        this.quickPick.updateItem(recentBuilds);
      });
  }

  public updateItem(recentBuild: Types.RecentBuild) {
    let text: string;
    switch (recentBuild.status) {
      case 'queued':
          text = 'CircleCI Status: $(kebab-horizontal) QUEUED';
          break;
      case 'running':
        text = 'CircleCI Status: $(kebab-horizontal) RUNNING';
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
