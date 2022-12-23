const core = require('@actions/core');
const github = require("@actions/github");
const orgName = core.getInput('org-name');
const repoName = core.getInput('repo-name');
const private = core.getInput('private').toLower() === 'true' || false ;
const token = core.getInput('token');
const operation = core.getInput('operation');

// most @actions toolkit packages have async methods
const run = async () => {
  try {
    const octokit = github.getOctokit(token);
    if (operation.toLowerCase() === 'create-repo') {
      const result = await octokit.request('POST /orgs/'+orgName+'/repos', {
        org: orgName,
        name: repoName,
        description: repoName +' repository created via automated process',
        private: private,
        auto_init: true,
        gitignore_template: "Node"
      });
      core.setOutput('message', result.data.name + " repository created");
    } else if (operation.toLowerCase() === 'rename-branch') {
      const branchName = core.getInput('curr-branch-name');
      const renamedBranchName = core.getInput('new-branch-name');
      const result = await octokit.request('POST /repos/'+orgName+'/'+repoName+'/branches/'+branchName+'/rename', {
        new_name: renamedBranchName
      });
      core.setOutput('message', result.data.name + " branch renamed");
    } else if (operation.toLowerCase() === 'create-branch') {
      const branchRef = core.getInput('branch-ref-name');
      const branchName = core.getInput('branch-name');
      const ref = await octokit.request('GET /repos/'+orgName+'/'+repoName+'/git/ref/heads/'+branchRef, {
        owner: orgName,
        repo: repoName,
        ref: 'heads/'+branchRef
      });
      const result = await octokit.request('POST /repos/'+orgName+'/'+repoName+'/git/refs', {
        owner: orgName,
        repo: repoName,
        ref: 'refs/heads/'+branchName,
        sha: ref.data.object.sha
      });
      core.setOutput('message', result.data.ref + " branch created");
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
