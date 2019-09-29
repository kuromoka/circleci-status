// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ApiClient, BuildNode } from './apiClient';
import { BuildStatusBar } from './buildStatusBar';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const statusBar = new BuildStatusBar();
  context.subscriptions.push(statusBar.item);

  const updateBuildStatus = (apiClient: ApiClient) => {
    apiClient.getRecentBuilds()
      .then((recentBuils: BuildNode[]) => {
        statusBar.updateItem(recentBuils[0]);
      });
  };

  const apiClient = new ApiClient();
  apiClient.setUserName()
    .then(() => {
      updateBuildStatus(apiClient);
      setInterval(updateBuildStatus, 60000, apiClient);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}
