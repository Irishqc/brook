const vscode = require('vscode');
const gitLabService = require('./gitlab_service');

let context = null;
let pipelineStatusBarItem = null;
let mrStatusBarItem = null;

const createStatusBarItem = (text, command) => {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  context.subscriptions.push(statusBarItem);
  statusBarItem.text = text;
  statusBarItem.show();

  if (command) {
    statusBarItem.command = command;
  }

  return statusBarItem;
}

async function refreshPipelines() {
  const pipeline = await gitLabService.fetchLastPipelineForCurrentBranch();
  const statuses = {
    running: { icon: 'pulse' },
    pending: { icon: 'clock' },
    success: { icon: 'check', text: 'passed' },
    failed: { icon: 'x' },
    canceled: { icon: 'circle-slash' },
    skipped: { icon: 'diff-renamed' },
  }

  if (pipeline) {
    const { status } = pipeline;
    pipelineStatusBarItem.text = `$(${statuses[status].icon}) GitLab: Pipeline ${statuses[status].text || status}`;
    pipelineStatusBarItem.show();
  } else {
    pipelineStatusBarItem.text = 'GitLab: No pipeline';
    pipelineStatusBarItem.hide();
  }
}

const initPipelineStatus = () => {
  pipelineStatusBarItem = createStatusBarItem('$(info) GitLab: Fetching pipeline...', 'gl.pipelineActions');
  setInterval(() => { refreshPipelines() }, 30000);

  refreshPipelines();
}

const initMrStatus = () => {
  mrStatusBarItem = createStatusBarItem('$(info) GitLab: Finding MR...', 'gl.openCurrentMergeRequest');
  setInterval(() => { fetchBranchMr() }, 60000);

  fetchBranchMr();
}

async function fetchBranchMr() {
  const mr = await gitLabService.fetchOpenMergeRequestForCurrentBranch();
  let text = '$(git-pull-request) GitLab: MR not found.';

  if (mr) {
    text = `$(git-pull-request) GitLab: MR !${mr.iid}`;
  }

  mrStatusBarItem.text = text;
}

const init = (ctx) => {
  context = ctx;

  initPipelineStatus();
  initMrStatus();
}

const dispose = () => {
  mrStatusBarItem.hide();
  pipelineStatusBarItem.hide();
}

exports.init = init;
exports.dispose = dispose;
exports.refreshPipelines = refreshPipelines;
