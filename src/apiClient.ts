import * as vscode from 'vscode';
import axios from 'axios';
import * as Types from './types';
import { pathToFileURL } from 'url';
import * as path from 'path';

let console = vscode.window.createOutputChannel('circleci');

export class ApiClient {
  private apiToken: string;
  private url: string;
  private gitBranch: string | undefined;
  private vcsType: string;
  private projectName: string;
  private userName: string;

  constructor(apiToken: string, url: string, userName: string, projectName: string) {
    this.apiToken = apiToken;
    this.url = url;
    this.userName = userName;
    this.projectName = projectName;
    // feature: selectable github/bitbucket
    this.vcsType = 'github';
  }

  public async setup() {
    try {
      this.gitBranch = await this.getCurrentBranch();

      // check to communicate with api
      const response = await this.requestApiWithGet('me', null);
      if (this.userName === '') {
        // username from API result if username configuration isn't set.
        this.userName = response.data.name;
      }
    } catch (err) {
      vscode.window.showErrorMessage('Failed to connect to API. Check your API token configuration.');
      throw new Error(err);
    }
  }

  private async getCurrentBranch(): Promise<string | undefined> {
    let branch: string | undefined;

    if (vscode.workspace.workspaceFolders) {
      let folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

      await vscode.workspace.openTextDocument(path.join(folderPath, '/.git/HEAD')).then((document) => {
        let text = document.getText();
        branch = text.split('/').pop();
        if (branch !== undefined) {
          branch = branch.trim();
        }
      });
    }

    return branch;
  }

  public async getRecentBuilds(): Promise<any> {
    try {
      const path = 'project/' + this.vcsType + '/' + this.userName + '/' + this.projectName;
      let recentBuilds: Types.RecentBuild[] = [];
      let offset = 0;

      while (recentBuilds.length === 0) {
        const response = await this.requestApiWithGet(path, offset);
        if (Object.keys(response.data).length === 0) {
          break;
        }

        response.data.forEach((element: any) => {
          if (this.gitBranch === undefined || element.branch === this.gitBranch) {
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
          offset += 1;
        });
      }
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

  private async requestApiWithGet(path: string, offset: number | null): Promise<any> {
    let url = this.url + '/' + path + '?circle-token=' + this.apiToken;
    if (offset !== null) {
      url += '&offset=' + offset;
    }
    console.appendLine('GET: ' + url);

    try {
      const response = await axios.get(url);
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }

  private async requestApiWithPost(path: string): Promise<any> {
    let url = this.url + '/' + path + '?circle-token=' + this.apiToken;
    console.appendLine('POST: ' + url);

    try {
      const response = await axios.post(url);
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }
}
