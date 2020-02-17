import {Octokit} from '@octokit/rest'
import {deploymentContext} from './deployment-context'
import {AppContext} from './app'

type DeploymentState = Octokit.ReposCreateDeploymentStatusParams['state']

export const createDeploymentStatusPayload = (
  deploymentId: number,
  context: AppContext
): Octokit.ReposCreateDeploymentStatusParams => {
  const {owner, repo} = deploymentContext(context)
  const state = context.getInput('state') as DeploymentState
  const environmentUrl = context.getInput('environmentUrl')
  const {sha} = context.gitHubContext
  const logUrl = `https://github.com/${owner}/${repo}/commit/${sha}/checks`
  return {
    owner,
    repo,
    auto_inactive: true,
    deployment_id: deploymentId,
    state,
    description: 'this is pr',
    log_url: logUrl,
    environment_url: environmentUrl
  }
}
