import * as path from 'path';
import { runTests } from 'vscode-test';

import createTmpWorkspace from './create_tmp_workspace';

async function go() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../');
    const extensionTestsPath = path.resolve(__dirname, '../test/integration');
    const temporaryWorkspace = await createTmpWorkspace();
    console.log(temporaryWorkspace);
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ['--disable-extensions', temporaryWorkspace],
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

go();
