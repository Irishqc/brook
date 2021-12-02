import * as vscode from 'vscode';
import { USER_COMMANDS } from './command_names';
import { IDetailedError, isDetailedError } from './errors/common';
import { HelpError } from './errors/help_error';
import { Help, HelpMessageSeverity } from './utils/help';

type logFunction = (line: string) => void;

let globalLog: logFunction = console.error;

export const initializeLogging = (logLine: logFunction): void => {
  globalLog = logLine;
};

export const log = (line: string): void => globalLog(line);

export const logError = (e: Error | IDetailedError): void =>
  isDetailedError(e) ? globalLog(e.details) : globalLog(`${e.message}\n${e.stack}`);

export const handleError = (e: Error | IDetailedError): { onlyForTesting: Promise<void> } => {
  logError(e);

  // This is probably the only place where we want to ignore a floating promise.
  // We don't want to block the app and wait for user click on the "Show Logs"
  // button or close the message However, for testing this method, we need to
  // keep the promise.
  if (HelpError.isHelpError(e)) {
    return { onlyForTesting: Help.showError(e, HelpMessageSeverity.Error) };
  }
  const showErrorMessage = async () => {
    const choice = await vscode.window.showErrorMessage(e.message, 'Show Logs');
    if (choice === 'Show Logs') {
      await vscode.commands.executeCommand(USER_COMMANDS.SHOW_OUTPUT);
    }
  };
  return { onlyForTesting: showErrorMessage() };
};
