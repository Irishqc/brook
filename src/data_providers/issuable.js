const vscode = require('vscode');
const gitLabService = require('../gitlab_service');

class DataProvider {
  constructor({ fetcher, issuableType }) {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;

    this.fetcher = fetcher;
    this.issuableType = issuableType || 'issue';
    this.issuableSign = this.issuableType === 'issue' ? '#' : '!';
  }

  async getChildren() {
    const items = [];
    const issues = await gitLabService[this.fetcher]();

    if (issues.length) {
      issues.forEach((issue) => {
        const title = `${this.issuableSign}${issue.iid} · ${issue.title}`;
        const item = new vscode.TreeItem(title);

        item.command = {
          command: 'vscode.open',
          arguments: [vscode.Uri.parse(issue.web_url)],
        }

        items.push(item);
      });
    } else {
      items.push(new vscode.TreeItem(`No ${this.issuableType} assigned to you.`));
    }

    return items;
  }

  getParent() {
    return null;
  }

  getTreeItem(item) {
    return item;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}

exports.DataProvider = DataProvider;
