export default {
  access: {
    param: 'private_token',
    value: '5VK28u4H9d39NFv1r7sv',
  },
  filter: {
    param: 'search',
  },
  pageSize: {
    param: 'per_page',
    value: 50,
  },
  brandsBranchesFilter: 'master',
  hotfixBranchesFilter: 'release',
  projects: {
    mobile: {
      key: 'air/air-mobile',
      name: 'air-mobile',
      type: 'mobile',
      mainBranch: 'master',
      mainBrand: 'com',
    },
    desktop: {
      key: 'air/air-pm',
      name: 'air-pm',
      type: 'desktop',
      mainBranch: 'develop',
      mainBrand: 'com',
    },
    mvp: {
      key: 'air/air-pm',
      name: 'air-pm',
      type: 'desktop',
      mainBranch: 'mvp-skeleton-kube',
      mainBrand: 'mvp',
    },
  },
  url: 'https://git.betlab.com/api/v4/projects/{project}/repository/branches?{params}',
  branchUrl: 'https://git.betlab.com/{project}/tree/{branch}',

  getGitLabUrl(project, params) {
    return this.url.replace('{project}', encodeURIComponent(project)).replace('{params}', params);
  },

  getGitLabBranchUrl(project, branch) {
    return this.branchUrl.replace('{project}', project).replace('{branch}', branch);
  },
};
