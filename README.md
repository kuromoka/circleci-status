# circleci-status

CircleCI Status is a VSCode extension to check CircleCI build status.

## Usage
- Set up CircleCi project and put YAML file to `.circleci/config.yml`.
- Set vscode configuration.
  - `circleciStatus.apiToken` is required. See [this page](https://circleci.com/docs/2.0/managing-api-tokens/#creating-a-personal-api-token) for getting API token.
  - `circleciStatus.url` is optional. Defaults to `https://circleci.sec.samsung.net/api/v1.1`. If it's different from default, you need to set this configuration to your circleci URL.
  - `circleciStatus.gitBranch` is optional. Defaults to ''(show all branches). If it's different from default, you need to set this configuration to a branch name you want to see.
  - `circleciStatus.projectName` is optional. Defaults to your workspace folder name. If it's different from CircleCi project name, you need to set this configuration to that name.
  - `circleciStatus.userName` is optional. Defaults to username from API result. If you want to work on organization repository, you need to set this configuration to organization name.
```json
{
    "circleciStatus.apiToken": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "circleciStatus.url": "https://<your circleci url>/api/v1.1",
    "circleciStatus.gitBranch": "master",
    "circleciStatus.projectName": "circleci-status",
    "circleciStatus.userName": "kuromoka"
}
```

## Features
### Latest build status on status bar
Here is SUCCESS status. Also supporting other status(RUNNING, FAILED etc...)

This status is auto-reloading by 1 minute.

<img width="164" alt="Latest build status on status bar" src="https://user-images.githubusercontent.com/22453562/65831069-53f36800-e2f0-11e9-8443-8a9816de84a6.png">

### Additional features
By clicking build status, you can use additional features.

![additional _features3](https://user-images.githubusercontent.com/22453562/65831912-3d9dda00-e2f9-11e9-9243-f3bb4a5f0081.gif)

#### Retry latest build
You cau retry latest build.

#### Open latest build url
Open latest build url on CircleCI.

#### Show build list
Show build list include past builds. Open the build url when you chos one of these.

<img width="603" alt="Show build list" src="https://user-images.githubusercontent.com/22453562/65831450-77201680-e2f4-11e9-8cba-7bad933834b7.png">

## Feedback
Feel free to open issue or contact [@kuromoka16](https://twitter.com/kuromoka16).

## License
MIT
