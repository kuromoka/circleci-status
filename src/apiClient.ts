import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';

export class ApiClient {
	static readonly API_ENTRY_POINT: string = 'https://circleci.com/api/v1.1';

	private apiToken: string | undefined;
	private projectName: string | undefined;
	private userName: string | undefined;

	constructor() {
		this.apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken');
		vscode.workspace.onDidChangeConfiguration(() => {
			this.apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken');
		});
		this.projectName = vscode.workspace.name;

		// set username from '/me' result
		this.requestApi('me')
			.then(data => this.userName = data.name)
			.catch(err => console.error(err));
	}

	private async requestApi(path : string) : Promise<any> {
		try {
			const result  = await axios.get(ApiClient.API_ENTRY_POINT + '/' + path + '?circle-token=' + this.apiToken);
			return result.data;
		} catch (err) {
			throw new err;
		}
	}
}
