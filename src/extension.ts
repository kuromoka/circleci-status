import * as vscode from 'vscode';
import { ApiClient } from './apiClient';
import { QuickPick } from './quickPick';
import { StatusBar } from './statusBar';

export async function activate(context: vscode.ExtensionContext) {
  let apiClient: ApiClient;
  let quickPick: QuickPick;
  let statusBar: StatusBar;

  const commandName = 'circleciStatus.selectCommand';
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = commandName;
  context.subscriptions.push(vscode.commands.registerCommand(commandName, async () => {
    try {
      if (quickPick && statusBar) {
        await quickPick.showItem(statusBar);
      }
    } catch (err) {
      console.log(err);
      return;
    }
  }));
  context.subscriptions.push(statusBarItem);

  const main = async (apiToken: string, url: string, userName: string, projectName: string) => {
    try {
      apiClient = new ApiClient(apiToken, url, userName, projectName);
      await apiClient.setup();

      quickPick = new QuickPick(apiClient);
      statusBar = new StatusBar(apiClient, quickPick, statusBarItem);
      await statusBar.setup();
    } catch (err) {
      if (statusBar) {
        // Not to continue showing error message.
        statusBar.clearStatusBarInterval();
      }
      console.log(err);
      return;
    }
  };

  const getConfig = () => {
    const apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken', '');
    if (apiToken === '') {
      return;
    }
    let url = vscode.workspace.getConfiguration('circleciStatus').get('url', '');
    if (url === '') {
      url = apiClient.API_ENTRY_POINT;
    }
    const userName = vscode.workspace.getConfiguration('circleciStatus').get('userName', '');
    let projectName = vscode.workspace.getConfiguration('circleciStatus').get('projectName', '');
    if (projectName === '') {
      // getting from workspace folder name
      projectName = typeof vscode.workspace.workspaceFolders === 'undefined' ? '' : vscode.workspace.workspaceFolders[0].name;
    }
    if (statusBar) {
      // clear old instance interval
      statusBar.clearStatusBarInterval();
    }
    main(apiToken, url, userName, projectName);
  };
  getConfig();
  vscode.workspace.onDidChangeConfiguration(getConfig);
}

export function deactivate() {}
