# GitLab CI variables autocompletion

We keep a local copy of all supported GitLab CI variables in [`ci_variables.json`](../src/completion/ci_variables.json). This file is generated by `npm run update-ci-variables` script. The same script is used in CI (job `check-ci-variables`) to check that our local copy is up to date with the [canonical documentation](https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/ci/variables/predefined_variables.md).

## What to do when the `check-ci-variables` job starts failing

1. Checkout a new branch
1. Run `npm run update-ci-variables`
1. Commit change with message: `chore(ci variables): update the ci_variables.json`
1. Create an MR
1. Paste the following snippet as the MR description:

   ```md
   This MR is the result of running the script to update the CI variable definition. There is no manual editing in this commit. The content of `ci_variables.json` is scraped from the official GitLab documentation.

   Documentation: https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/blob/main/docs/developer/ci-variables.md

   A script generated this code change, so this MR will merge without a second review.

   /label ~"devops::create" ~"group::code review" ~"VS Code" ~"Category:Editor Extension" ~"section::dev" ~"type::maintenance"
   ```

1. Perform a quick review of the change.
1. Merge the MR without assigning an additional reviewer. ([Explanation of the review process exception](https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/merge_requests/481))
