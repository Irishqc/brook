import * as vscode from 'vscode';
import { Credentials, tokenService } from '../services/token_service';

export async function pickInstance(): Promise<Credentials | undefined> {
  const credentials = tokenService.getAllCredentials();
  const instanceItems = credentials.map(c => ({
    label: `$(cloud) ${c.instanceUrl}`,
    credentials: c,
  }));
  if (instanceItems.length === 0) {
    throw new Error('no GitLab instance found');
  }
  let selectedCredentials;
  if (instanceItems.length === 1) {
    [selectedCredentials] = instanceItems;
  } else {
    selectedCredentials = await vscode.window.showQuickPick(instanceItems, {
      ignoreFocusOut: true,
      placeHolder: 'Select GitLab instance',
    });
  }
  if (!selectedCredentials) {
    return undefined;
  }
  return selectedCredentials.credentials;
}
