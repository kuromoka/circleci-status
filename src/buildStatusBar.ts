import * as vscode from 'vscode';
import { BuildNode } from './apiClient';

export class BuildStatusBar {
	private recentBuild: BuildNode;
	private _item: vscode.StatusBarItem;

	constructor(recentBuild: BuildNode ) {
		this.recentBuild = recentBuild;
		this._item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	}

	get item() {
		return this._item;
	}

	public updateItem() {
		let text : string;
		switch (this.recentBuild.status) {
			case 'success':
				text = 'success!';
				break;
			case 'running':
				text = 'running';
				break;
			case 'failed':
				text = 'failed';
				break;
			default:
				text = 'unknown';
				break;
		}

		this._item.text = text;
		this._item.show();
	}
}
