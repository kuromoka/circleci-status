// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ApiClient, BuildNode } from './apiClient';
import { StatusBar } from './statusBar';
import { QuickPick } from './quickPick';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const statusBarCommand = 'circleciStatus.selectCommand';
  const quickPick = new QuickPick();
  context.subscriptions.push(vscode.commands.registerCommand(statusBarCommand, () => {
    quickPick.showItem();
  }));

  const statusBar = new StatusBar(statusBarCommand);
  context.subscriptions.push(statusBar.item);

  const updateBuildStatus = (apiClient: ApiClient) => {
    apiClient.getRecentBuilds()
      .then((recentBuilds: BuildNode[]) => {
        statusBar.updateItem(recentBuilds[0]);
        quickPick.updateItem(recentBuilds);
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
