// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ApiClient, BuildNode } from './apiClient';
import { BuildStatusBar } from './buildStatusBar';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const apiClient = new ApiClient();

	apiClient.setUserName()
		.then(() => {
			return apiClient.getRecentBuilds();
		})
		.then((recentBuils : BuildNode[]) => {
			const statusBar = new BuildStatusBar(recentBuils[0]);
			context.subscriptions.push(statusBar.item);
			statusBar.updateItem();
		});
}

// this method is called when your extension is deactivated
export function deactivate() {}
