const { setupServer } = require('msw/node');
const { rest, graphql } = require('msw');
const vscode = require('vscode');
const assert = require('assert');
const { API_URL_PREFIX, GITLAB_URL } = require('./test_infrastructure/constants');
const { tokenService } = require('../../src/services/token_service');
const gitLabService = require('../../src/gitlab_service');
const { GitLabNewService } = require('../../src/gitlab/gitlab_new_service');
const snippetsResponse = require('./fixtures/graphql/snippets.json');

const validateUserAgent = req => {
  const userAgent = req.headers.get('User-Agent');
  assert(
    userAgent.startsWith('vs-code-gitlab-workflow/'),
    `User-Agent header ${userAgent} must start with vs-code-gitlab-workflow/`,
  );
};

describe('User-Agent header', () => {
  let server;
  let capturedRequest;

  before(async () => {
    await vscode.commands.executeCommand('gl.refreshSidebar');
    server = setupServer(
      rest.get(`${API_URL_PREFIX}/user`, (req, res, ctx) => {
        capturedRequest = req;
        return res(ctx.status(200), ctx.json({}));
      }),
      graphql.query('GetSnippets', (req, res, ctx) => {
        capturedRequest = req;
        return res(ctx.data(snippetsResponse));
      }),
    );
    server.listen();

    await tokenService.setToken(GITLAB_URL, 'abcd-secret');
  });

  beforeEach(() => {
    server.resetHandlers();
    capturedRequest = undefined;
  });

  after(async () => {
    server.close();
    await tokenService.setToken(GITLAB_URL, undefined);
  });

  it('is sent with requests from GitLabService', async () => {
    await gitLabService.fetchCurrentUser();
    validateUserAgent(capturedRequest);
  });

  it('is sent with requests from GitLabNewService', async () => {
    const subject = new GitLabNewService(GITLAB_URL);
    await subject.getSnippets('gitlab-org/gitlab');
    validateUserAgent(capturedRequest);
  });
});
