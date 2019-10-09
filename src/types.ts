export interface RecentBuild {
  status: string;
  buildUrl: string;
  buildNum: number;
  subject: string;
  branch: string;
  committerName: string;
  usageQueuedAt: string;
}
