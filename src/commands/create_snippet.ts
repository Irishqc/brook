import * as vscode from 'vscode';
import * as openers from '../openers';
import * as gitLabService from '../gitlab_service';
import { gitExtensionWrapper } from '../git/git_extension_wrapper';
import { GitLabProject } from '../gitlab/gitlab_project';

const visibilityOptions = [
  {
    label: 'Public',
    type: 'public',
  },
  {
    label: 'Internal',
    type: 'internal',
  },
  {
    label: 'Private',
    type: 'private',
  },
];

const contextOptions = [
  {
    label: 'Snippet from file',
    type: 'file',
  },
  {
    label: 'Snippet from selection',
    type: 'selection',
  },
];

async function uploadSnippet(
  project: GitLabProject,
  editor: vscode.TextEditor,
  visibility: string,
  context: string,
  repositoryRoot: string,
) {
  let content = '';
  const fileName = editor.document.fileName.split('/').reverse()[0];

  if (context === 'selection' && editor.selection) {
    const { start, end } = editor.selection;
    const endLine = end.line + 1;
    const startPos = new vscode.Position(start.line, 0);
    const endPos = new vscode.Position(endLine, 0);
    const range = new vscode.Range(startPos, endPos);
    content = editor.document.getText(range);
  } else {
    content = editor.document.getText();
  }

  const data = {
    id: project.restId,
    title: fileName,
    file_name: fileName,
    visibility,
    content,
  };

  const snippet = await gitLabService.createSnippet(repositoryRoot, data);

  await openers.openUrl(snippet.web_url);
}

export async function createSnippet() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    await vscode.window.showInformationMessage('GitLab Workflow: No open file.');
    return;
  }
  const repository = await gitExtensionWrapper.getActiveRepositoryOrSelectOne();
  if (!repository) return;
  const project = await repository.getProject();

  if (!project) {
    await vscode.window.showInformationMessage(
      'GitLab Workflow: Repository does not contain GitLab project.',
    );
    return;
  }

  const visibility = await vscode.window.showQuickPick(visibilityOptions);
  if (!visibility) return;

  const context = await vscode.window.showQuickPick(contextOptions);
  if (!context) return;

  await uploadSnippet(project, editor, visibility.type, context.type, repository.rootFsPath);
}