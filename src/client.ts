import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';
import { QuickPick } from './quickPick';
import { StatusBar } from './statusBar';

export interface BuildNode {
  status: string;
  buildUrl: string;
  buildNum: number;
  subject: string;
  branch: string;
  committerName: string;
  usageQueuedAt: string;
}

export class Client {
  static readonly API_ENTRY_POINT: string = 'https://circleci.com/api/v1.1';

  private quickPick: QuickPick;
  private statusBar: StatusBar;
  private apiToken: string | undefined;
  private vcsType: string;
  private userName: string | undefined;
  private projectName: string | undefined;

  constructor(context: vscode.ExtensionContext) {
    const statusBarCommand = 'circleciStatus.selectCommand';
    this.quickPick = new QuickPick();
    context.subscriptions.push(vscode.commands.registerCommand(statusBarCommand, () => {
      this.quickPick.showItem(this);
    }));
  
    this.statusBar = new StatusBar(statusBarCommand);
    context.subscriptions.push(this.statusBar.item);

    this.apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken');
    vscode.workspace.onDidChangeConfiguration(() => {
      this.apiToken = vscode.workspace.getConfiguration('circleciStatus').get('apiToken');
    });
    // feature: selectable github/bitbucket
    this.vcsType = 'github';
    this.projectName = vscode.workspace.name;
  }

  public entry() {  
    this.setUserName()
      .then(() => {
        this.updateBuildStatus();

        const self = this;
        setInterval(() => {
          self.updateBuildStatus();
        }, 60000);
      });
  }

  public updateBuildStatus() {
    this.getRecentBuilds()
      .then((recentBuilds: BuildNode[]) => {
        this.statusBar.updateItem(recentBuilds[0]);
        this.quickPick.updateItem(recentBuilds);
      });
  }

  public retryBuild(buildNum: number): Promise<any> {
    const path: string = 'project/' + this.vcsType + '/' + this.userName + '/' + this.projectName + '/' + buildNum + '/' + 'retry';

    return this.requestApiWithPost(path)
      .then(() => {
        vscode.window.showInformationMessage('Start to retry build');
      })
      .catch((err) => console.error(err));
  }

  private setUserName(): Promise<any> {
    // set username from '/me' result
    return this.requestApiWithGet('me')
      .then((response) => {
        this.userName = response.data.name;
      })
      .catch((err) => console.error(err));
  }

  private getRecentBuilds(): Promise<any> {
    let recentBuilds: BuildNode[] = [];
    const path: string = 'project/' + this.vcsType + '/' + this.userName + '/' + this.projectName;

    return this.requestApiWithGet(path)
      .then(response => {
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
      })
      .catch(err => console.error(err));
  }

  private async requestApiWithGet(path: string): Promise<any> {
    try {
      const response = await axios.get(Client.API_ENTRY_POINT + '/' + path + '?circle-token=' + this.apiToken);
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }

  private async requestApiWithPost(path: string): Promise<any> {
    try {
      const response = await axios.post(Client.API_ENTRY_POINT + '/' + path + '?circle-token=' + this.apiToken);
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }
}
