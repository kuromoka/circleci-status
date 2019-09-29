import * as vscode from 'vscode';
import { Client, BuildNode } from './Client';

export class QuickPick {
  static readonly LATEST_RETRY_ITEM_LABEL: string = 'Retry latest build';
  static readonly LATEST_BUILD_URL_ITEM_LABEL: string = 'Open latest build url';
  static readonly SHOW_BUILD_LIST_ITEM_LABEL: string = 'Show build list';

  private recentBuilds: BuildNode[];
  private latestRetryItem: vscode.QuickPickItem;
  private latestBuildUrlItem: vscode.QuickPickItem;
  private showBuildListItem: vscode.QuickPickItem;

  constructor() {
    this.recentBuilds = [];
    this.latestRetryItem = {
      label: QuickPick.LATEST_RETRY_ITEM_LABEL,
      detail: 'Retry latest build'
    };
    this.latestBuildUrlItem = {
      label: QuickPick.LATEST_BUILD_URL_ITEM_LABEL,
      detail: 'Open latest build url'
    };
    this.showBuildListItem = {
      label: QuickPick.SHOW_BUILD_LIST_ITEM_LABEL,
      detail: 'Show build list'
    };
  }

  public async showItem(client: Client) { 
    await vscode.window.showQuickPick([this.latestRetryItem, this.latestBuildUrlItem, this.showBuildListItem]).then(selectedItem => {
      switch (selectedItem!.label) {
        case QuickPick.LATEST_RETRY_ITEM_LABEL:
            client.retryBuild(this.recentBuilds[0].buildNum).then(() => {
              client.updateBuildStatus();
            });
            break;
        case QuickPick.LATEST_BUILD_URL_ITEM_LABEL:
          vscode.env.openExternal(vscode.Uri.parse(this.recentBuilds[0].buildUrl));
          break;
        case QuickPick.SHOW_BUILD_LIST_ITEM_LABEL:
            let items: vscode.QuickPickItem[] = [];
            this.recentBuilds.forEach((recentBuild: BuildNode) => {
              items.push({
                label: recentBuild.status + ': ' + recentBuild.branch + ' #' + recentBuild.buildNum,
                detail: recentBuild.subject
              });
            });
            vscode.window.showQuickPick(items);
            break;
        default:
          break;
      }
    });
  }

  public updateItem(recentBuilds: BuildNode[]) {
    this.recentBuilds = recentBuilds;
  }
}
