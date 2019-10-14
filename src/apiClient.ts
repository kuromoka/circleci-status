import * as vscode from 'vscode';
import axios from 'axios';
import * as Types from './types';

export class ApiClient {
  static readonly API_ENTRY_POINT: string = 'https://circleci.com/api/v1.1';

  private apiToken: string | undefined;
  private vcsType: string;
  private projectName: string | undefined;
  private projectPath: string;

  constructor() {
    this.apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken');
    vscode.workspace.onDidChangeConfiguration(() => {
      this.apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken');
    });
    // feature: selectable github/bitbucket
    this.vcsType = 'github';
    this.projectName = vscode.workspace.name;
    this.projectPath = '';
  }

  public async setup() {
    // set username from '/me' result
    const response = await this.requestApiWithGet('me');
    this.projectPath = 'project/' + this.vcsType + '/' + response.data.name + '/' + this.projectName;
  }

  public async getRecentBuilds(): Promise<any> {
    let recentBuilds: Types.RecentBuild[] = [];

    const response = await this.requestApiWithGet(this.projectPath);
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

  public async retryBuild(buildNum: number): Promise<any> {
    const path: string = this.projectPath + '/' + buildNum + '/' + 'retr';

    await this.requestApiWithPost(path);
    vscode.window.showInformationMessage('Start to retry build');
  }

  private async requestApiWithGet(path: string): Promise<any> {
    console.log(path);
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
