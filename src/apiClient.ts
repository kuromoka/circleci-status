import * as vscode from 'vscode';
import axios from 'axios';
import * as Types from './types';

export class ApiClient {
  readonly API_ENTRY_POINT: string = 'https://circleci.com/api/v1.1';

  private apiToken: string;
  private url: string;
  private gitBranch: string;
  private vcsType: string;
  private projectName: string;
  private userName: string;

  constructor(apiToken: string, url: string, gitBranch: string, userName: string, projectName: string) {
    this.apiToken = apiToken;
    this.url = url;
    this.gitBranch = gitBranch;
    this.userName = userName;
    this.projectName = projectName;
    // feature: selectable github/bitbucket
    this.vcsType = 'github';
  }

  public async setup() {
    try {
      // check to communicate with api
      const response = await this.requestApiWithGet('me');
      if (this.userName === '') {
        // username from API result if username configuration isn't set.
        this.userName = response.data.name;
      }
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
        if (this.gitBranch === '' || element.branch === this.gitBranch) {
          recentBuilds.push({
            status: element.status,
            buildUrl: element.build_url,
            buildNum: element.build_num,
            subject: element.subject === null ? '' : element.subject,
            branch: element.branch,
            committerName: element.committer_name === null ? '' : element.committer_name,
            workflowName: element.workflows ? element.workflows.workflow_name : '',
            jobName: element.workflows ? element.workflows.job_name : '',
            usageQueuedAt: element.usage_queued_at
          });
        }
      });
      return recentBuilds;
    } catch (err) {
      vscode.window.showErrorMessage('Failed to get builds.');
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
      const response = await axios.get(this.url + '/' + path + '?circle-token=' + this.apiToken);
      return response;
    } catch (err) {
      throw new Error(err);
    } finally {
      console.log('GET: ' + this.url + '/' + path + '?circle-token=' + this.apiToken);
    }
  }

  private async requestApiWithPost(path: string): Promise<any> {
    try {
      const response = await axios.post(this.url + '/' + path + '?circle-token=' + this.apiToken);
      return response;
    } catch (err) {
      throw new Error(err);
    } finally {
      console.log('POST: ' + this.url + '/' + path + '?circle-token=' + this.apiToken);
    }
  }
}
