import * as vscode from 'vscode';
import * as Types from './types';
import { ApiClient } from './ApiClient';
import { StatusBar } from './StatusBar';

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

  public updateItem(recentBuilds: Types.RecentBuild[]) {
    this.recentBuilds = recentBuilds;
  }

  public showItem(statusBar: StatusBar) { 
    vscode.window.showQuickPick([this.latestRetryItem, this.latestBuildUrlItem, this.showBuildListItem]).then(selectedItem => {
      switch (selectedItem!.label) {
        case QuickPick.LATEST_RETRY_ITEM_LABEL:
            this.apiClient.retryBuild(this.recentBuilds[0].buildNum).then(() => {
              statusBar.updateBuildStatus();
            });
            break;
        case QuickPick.LATEST_BUILD_URL_ITEM_LABEL:
          vscode.env.openExternal(vscode.Uri.parse(this.recentBuilds[0].buildUrl));
          break;
        case QuickPick.SHOW_BUILD_LIST_ITEM_LABEL:
            let items: vscode.QuickPickItem[] = [];
            this.recentBuilds.forEach((recentBuild: Types.RecentBuild) => {
              items.push({
                label: recentBuild.status.toUpperCase() + ': ' + recentBuild.branch + ' #' + recentBuild.buildNum,
                detail: recentBuild.committerName + ' ' + recentBuild.subject
              });
            });
            vscode.window.showQuickPick(items);
            break;
        default:
          break;
      }
    });
  }
}
