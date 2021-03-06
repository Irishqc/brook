import * as vscode from 'vscode';
import { fromReviewUri } from './review_uri';
import { ApiContentProvider } from './api_content_provider';
import { gitExtensionWrapper } from '../git/git_extension_wrapper';

const provideApiContentAsFallback = (uri: vscode.Uri) =>
  new ApiContentProvider().provideTextDocumentContent(uri);

export class GitContentProvider implements vscode.TextDocumentContentProvider {
  // eslint-disable-next-line class-methods-use-this
  async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    const params = fromReviewUri(uri);
    if (!params.path || !params.commit) return '';
    const repository = gitExtensionWrapper.getRepository(params.repositoryRoot);
    const result = await repository.getFileContent(params.path, params.commit);
    return result || provideApiContentAsFallback(uri);
  }
}
