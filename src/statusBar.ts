import * as vscode from 'vscode';
import * as Types from './types';
import { ApiClient } from './ApiClient';
import { QuickPick } from './QuickPick';

export class StatusBar {
  static readonly COMMAND_NAME: string = 'circleciStatus.selectCommand';

  private context: vscode.ExtensionContext;
  private apiClient: ApiClient;
  private quickPick: QuickPick;
  private statusBarItem: vscode.StatusBarItem;

  constructor(context: vscode.ExtensionContext, apiClient: ApiClient, quickPick: QuickPick) {
    this.context = context;
    this.apiClient = apiClient;
    this.quickPick = quickPick;
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  }

  public async setup() {
      this.context.subscriptions.push(vscode.commands.registerCommand(StatusBar.COMMAND_NAME, async () => {
        try {
          await this.quickPick.showItem(this);
        } catch (err) {
          console.log(err)
        }
      }));
      this.statusBarItem.command = StatusBar.COMMAND_NAME;
      this.context.subscriptions.push(this.statusBarItem);

      await this.updateBuildStatus();
      const self = this;
      setInterval(() => {
        self.updateBuildStatus();
      }, 60000);
  }

  public async updateBuildStatus(): Promise<any> {
    const recentBuilds: Types.RecentBuild[] = await this.apiClient.getRecentBuilds();
    this.updateItem(recentBuilds[0]);
    this.quickPick.updateRecentBuilds(recentBuilds);
  }

  public updateItem(recentBuild: Types.RecentBuild | undefined) {
    let text: string;
    if (typeof recentBuild === 'undefined') {
      text = 'CircleCI Status: Build not found';
    } else {
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
    }

    this.statusBarItem.text = text;
    this.statusBarItem.show();
  }
}
