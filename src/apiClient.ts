import * as vscode from 'vscode';
import axios from 'axios';
import * as Types from './types';

export class ApiClient {
  static readonly API_ENTRY_POINT: string = 'https://circleci.com/api/v1.1';

  private apiToken: string;
  private vcsType: string;
  private projectName: string;
  private userName: string;

  constructor(apiToken: string, projectName: string) {
    this.apiToken = apiToken;
    this.projectName = projectName;
    // feature: selectable github/bitbucket
    this.vcsType = 'github';
    this.userName = '';
  }

  public async setup() {
    // set username from '/me' entry point result
    try {
      const response = await this.requestApiWithGet('me');
      this.userName = response.data.name;
    } catch (err) {
      vscode.window.showErrorMessage('Failed to connect to API. Check your API token configuration.');
      throw new Error(err);
    }
  }

  public async getRecentBuilds(): Promise<any> {
    try {
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
    } catch (err) {
      vscode.window.showErrorMessage('Failed to get builds. Check your workspace folder name or project name configuration.');
      throw new Error(err);
    }
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
