import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';

export interface BuildNode {
  status: string;
  buildUrl: string;
  buildNum: Int16Array;
  subject: string;
  branch: string;
  committerName: string;
}

export class ApiClient {
  static readonly API_ENTRY_POINT: string = 'https://circleci.com/api/v1.1';

  private apiToken: string | undefined;
  private vcsType: string;
  private userName: string | undefined;
  private projectName: string | undefined;

  constructor() {
    this.apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken');
    vscode.workspace.onDidChangeConfiguration(() => {
      this.apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken');
    });
    // feature: selectable github/bitbucket
    this.vcsType = 'github';
    this.projectName = vscode.workspace.name;
  }

  public setUserName(): Promise<any> {
    // set username from '/me' result
    return this.requestApi('me')
      .then((response) => {
        this.userName = response.data.name;
      })
      .catch((err) => console.error(err));
  }

  public getRecentBuilds(): Promise<any> {
    let recentBuilds: BuildNode[] = [];
    const path: string = 'project/' + this.vcsType + '/' + this.userName + '/' + this.projectName;

    return this.requestApi(path)
      .then(response => {
        response.data.forEach((element: any) => {
          recentBuilds.push({
            status: element.status,
            buildUrl: element.build_url,
            buildNum: element.build_num,
            subject: element.subject,
            branch: element.branch,
            committerName: element.committer_name,
          });
        });
        return recentBuilds;
      })
      .catch(err => console.error(err));
  }

  private async requestApi(path: string): Promise<any> {
    try {
      const response = await axios.get(ApiClient.API_ENTRY_POINT + '/' + path + '?circle-token=' + this.apiToken);
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }
}
