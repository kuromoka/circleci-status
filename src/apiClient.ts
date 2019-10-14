import * as vscode from 'vscode';
import axios from 'axios';
import * as Types from './types';

export class ApiClient {
  static readonly API_ENTRY_POINT: string = 'https://circleci.com/api/v1.1';

  private apiToken: string;
  private vcsType: string;
  private projectName: string;
  private userName: string;

  constructor() {
    this.apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken', '');
    this.projectName = vscode.workspace.getConfiguration('circleciStatus').get('projectName', '');
    if (this.projectName === '') {
      this.projectName = typeof vscode.workspace.workspaceFolders === 'undefined' ? '' : vscode.workspace.workspaceFolders[0].name;
    }
    vscode.workspace.onDidChangeConfiguration(() => {
      this.apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken', '');
      this.projectName = vscode.workspace.getConfiguration('circleciStatus').get('projectName', '');
      if (this.projectName === '') {
        this.projectName = typeof vscode.workspace.workspaceFolders === 'undefined' ? '' : vscode.workspace.workspaceFolders[0].name;
      }
    });
    // feature: selectable github/bitbucket
    this.vcsType = 'github';
    this.userName = '';
  }

  public async setup() {
    // set username from '/me' result
    const response = await this.requestApiWithGet('me');
    this.userName = response.data.name;
  }

  public async getRecentBuilds(): Promise<any> {
    const path = 'project/' + this.vcsType + '/' + this.userName + '/' + this.projectName;
    let recentBuilds: Types.RecentBuild[] = [];

    const response = await this.requestApiWithGet(path);
    response.data.forEach((element: any) => {
      recentBuilds.push({
        status: element.status,
        buildUrl: element.build_url,
        buildNum: element.build_num,
        subject: element.subject === null ? '' : element.subject,
        branch: element.branch,
        committerName: element.committer_name === null ? '' : element.committer_name,
        usageQueuedAt: element.usage_queued_at
      });
    });
    return recentBuilds;
  }

  public async retryBuild(buildNum: number) {
    const path = 'project/' + this.vcsType + '/' + this.userName + '/' + this.projectName + '/' + buildNum + '/' + 'retry';

    await this.requestApiWithPost(path);
    vscode.window.showInformationMessage('Start to retry build');
  }

  private async requestApiWithGet(path: string): Promise<any> {
    try {
      const response = await axios.get(ApiClient.API_ENTRY_POINT + '/' + path + '?circle-token=' + this.apiToken);
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }

  private async requestApiWithPost(path: string): Promise<any> {
    try {
      const response = await axios.post(ApiClient.API_ENTRY_POINT + '/' + path + '?circle-token=' + this.apiToken);
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }
}
