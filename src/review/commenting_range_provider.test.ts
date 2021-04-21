import * as vscode from 'vscode';
import { mr, mrVersion } from '../test_utils/entities';
import { CommentingRangeProvider } from './commenting_range_provider';
import { ReviewParams, toReviewUri } from './review_uri';
import { getExtensionConfiguration } from '../utils/get_extension_configuration';
import { FF_COMMENTING_RANGES } from '../constants';

jest.mock('../utils/get_extension_configuration');

describe('CommentingRangeProvider', () => {
  let commentingRangeProvider: CommentingRangeProvider;
  const commonUriParams: ReviewParams = {
    path: `/path`,
    mrId: mr.id,
    projectId: mr.project_id,
    commit: mrVersion.base_commit_sha,
    workspacePath: '/',
  };

  const oldFileUrl = toReviewUri({
    ...commonUriParams,
    commit: mrVersion.base_commit_sha,
  });

  const newFileUri = toReviewUri({
    ...commonUriParams,
    commit: mrVersion.head_commit_sha,
  });

  beforeEach(() => {
    (getExtensionConfiguration as jest.Mock).mockReturnValue({
      featureFlags: [FF_COMMENTING_RANGES],
    });
    commentingRangeProvider = new CommentingRangeProvider(mr, mrVersion);
  });

  it('returns empty array for different URI schema', () => {
    const testDocument = {
      uri: vscode.Uri.parse('https://example.com'),
    } as vscode.TextDocument;
    expect(commentingRangeProvider.provideCommentingRanges(testDocument)).toEqual([]);
  });

  it('returns full range (all lines in the document) for old file', () => {
    const testDocument = {
      uri: oldFileUrl,
      lineCount: 200,
    } as vscode.TextDocument;
    expect(commentingRangeProvider.provideCommentingRanges(testDocument)).toEqual([
      new vscode.Range(new vscode.Position(0, 0), new vscode.Position(199, 0)),
    ]);
  });

  it('returns empty array for new file', () => {
    const testDocument = {
      uri: newFileUri,
    } as vscode.TextDocument;
    expect(commentingRangeProvider.provideCommentingRanges(testDocument)).toEqual([]);
  });

  it('returns empty array with the feature flag off', () => {
    (getExtensionConfiguration as jest.Mock).mockReturnValue({
      featureFlags: undefined,
    });
    const testDocument = {
      uri: oldFileUrl,
      lineCount: 200,
    } as vscode.TextDocument;
    expect(commentingRangeProvider.provideCommentingRanges(testDocument)).toEqual([]);
  });
});
