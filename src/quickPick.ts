import * as vscode from 'vscode';
import { BuildNode } from './apiClient';

export class QuickPick {
  static readonly LATEST_RETRY_ITEM_LABEL: string = 'Restart Latest Build';
  static readonly LATEST_BUILD_URL_ITEM_LABEL: string = 'Latest Build Url';

  private recentBuilds: BuildNode[];
  private latestRetryItem: vscode.QuickPickItem;
  private latestBuildUrlItem: vscode.QuickPickItem;

  constructor() {
    this.recentBuilds = [];
    this.latestRetryItem = {
      label: QuickPick.LATEST_RETRY_ITEM_LABEL
    };
    this.latestBuildUrlItem = {
      label: QuickPick.LATEST_BUILD_URL_ITEM_LABEL
    };
  }

  public showItem() { 
    vscode.window.showQuickPick([this.latestRetryItem, this.latestBuildUrlItem]).then(selectedItem => {
      switch (selectedItem!.label) {
        case QuickPick.LATEST_BUILD_URL_ITEM_LABEL:
          vscode.env.openExternal(vscode.Uri.parse(this.recentBuilds[0].buildUrl));
          break;
        default:
          break;
      }
    });
  }

  public updateItem(recentBuilds: BuildNode[]) {
    this.recentBuilds = recentBuilds;
    this.latestRetryItem.detail = 'Retry latest nuild';
    this.latestBuildUrlItem.detail = 'Open latest build url';
  }
}
