import { ValidBranchState, CurrentBranchRefresher } from './current_branch_refresher';
import { gitExtensionWrapper } from './git/git_extension_wrapper';
import { extensionState } from './extension_state';
import { asMock } from './test_utils/as_mock';
import { pipeline, project, mr, issue, job } from './test_utils/entities';

jest.mock('./git/git_extension_wrapper');
jest.mock('./extension_state');

describe('CurrentBranchRefrehser', () => {
  beforeEach(() => {
    asMock(extensionState.isValid).mockReturnValue(true);
  });

  describe('invalid state', () => {
    it('returns invalid state if the current repo does not contain GitLab project', async () => {
      asMock(gitExtensionWrapper.getActiveRepository).mockReturnValue({
        getProject: async () => undefined,
      });
      const state = await CurrentBranchRefresher.getState(false);
      expect(state.valid).toBe(false);
    });

    it('returns invalid state if fetching the mr and pipelines fails', async () => {
      asMock(gitExtensionWrapper.getActiveRepository).mockReturnValue({
        getProject: async () => project,
        getTrackingBranchName: async () => 'branch',
        getGitLabService: () => ({
          getPipelineAndMrForCurrentBranch: () => Promise.reject(new Error()),
        }),
      });
      const state = await CurrentBranchRefresher.getState(false);
      expect(state.valid).toBe(false);
    });
  });

  describe('valid state', () => {
    beforeEach(() => {
      asMock(gitExtensionWrapper.getActiveRepository).mockReturnValue({
        getProject: async () => project,
        getTrackingBranchName: async () => 'branch',
        getGitLabService: () => ({
          getMrClosingIssues: () => [issue],
          getPipelineAndMrForCurrentBranch: () => ({ pipeline, mr }),
          getJobsForPipeline: () => [job],
        }),
      });
    });

    it('returns valid state if GitLab service returns pipeline and mr', async () => {
      const state = await CurrentBranchRefresher.getState(false);

      expect(state.valid).toBe(true);
      expect((state as ValidBranchState).pipeline).toEqual(pipeline);
      expect((state as ValidBranchState).mr).toEqual(mr);
      expect((state as ValidBranchState).issues).toEqual([issue]);
    });
  });
});
