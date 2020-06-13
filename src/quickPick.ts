import * as vscode from 'vscode';
import * as Types from './types';
import { ApiClient } from './apiClient';
import { StatusBar } from './statusBar';

export class QuickPick {
  static readonly LATEST_RETRY_ITEM_LABEL: string = 'CircleCI Status: Retry latest build';
  static readonly LATEST_BUILD_URL_ITEM_LABEL: string = 'CircleCI Status: Open latest build url';
  static readonly SHOW_BUILD_LIST_ITEM_LABEL: string = 'CircleCI Status: Show build list';

  private apiClient: ApiClient;
  private recentBuilds: Types.RecentBuild[];
  private latestRetryItem: vscode.QuickPickItem;
  private latestBuildUrlItem: vscode.QuickPickItem;
  private showBuildListItem: vscode.QuickPickItem;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.recentBuilds = [];
    this.latestRetryItem = {
      label: QuickPick.LATEST_RETRY_ITEM_LABEL,
    };
    this.latestBuildUrlItem = {
      label: QuickPick.LATEST_BUILD_URL_ITEM_LABEL,
    };
    this.showBuildListItem = {
      label: QuickPick.SHOW_BUILD_LIST_ITEM_LABEL,
    };
  }

  public updateRecentBuilds(recentBuilds: Types.RecentBuild[]) {
    this.recentBuilds = recentBuilds;
  }

  public async showItem(statusBar: StatusBar) { 
    if (this.recentBuilds.length === 0) {
      return;
    }

    const selectedItem = await vscode.window.showQuickPick([this.latestRetryItem, this.latestBuildUrlItem, this.showBuildListItem]);
    if (!selectedItem) {
      return;
    }
    switch (selectedItem.label) {
      case QuickPick.LATEST_RETRY_ITEM_LABEL:
        await this.apiClient.retryBuild(this.recentBuilds[0].buildNum);
        statusBar.updateBuildStatus();
        break;
      case QuickPick.LATEST_BUILD_URL_ITEM_LABEL:
        vscode.env.openExternal(vscode.Uri.parse(this.recentBuilds[0].buildUrl));
        break;
      case QuickPick.SHOW_BUILD_LIST_ITEM_LABEL:
        let items: Types.BuildListQuickPickItem[] = [];
        this.recentBuilds.forEach((recentBuild: Types.RecentBuild) => {
          items.push({
            buildUrl: recentBuild.buildUrl,
            label: recentBuild.status.toUpperCase() + ': ' + recentBuild.branch + ' #' + recentBuild.buildNum,
            description: recentBuild.workflowName + ' / ' + recentBuild.jobName,
            detail: recentBuild.committerName + ' ' + recentBuild.subject
          });
        });
        const selectedBuildListItem = await vscode.window.showQuickPick(items);
        if (selectedBuildListItem) {
          vscode.env.openExternal(vscode.Uri.parse(selectedBuildListItem.buildUrl))
        }
        break;
      default:
        break;
    }
  }
}
