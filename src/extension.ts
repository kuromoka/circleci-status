// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ApiClient } from './ApiClient';
import { QuickPick } from './QuickPick';
import { StatusBar } from './StatusBar';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  try {
    const apiClient = new ApiClient();
    await apiClient.setup();

    const quickPick = new QuickPick(apiClient);
    const statusBar = new StatusBar(context, apiClient, quickPick);
    await statusBar.setup();
  } catch (err) {
    console.log(err);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
