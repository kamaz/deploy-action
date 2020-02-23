import {Octokit} from '@octokit/rest'
import {deploymentContext} from './deployment-context'
import {AppContext} from './app'

export type DeploymentState = Octokit.ReposCreateDeploymentStatusParams['state']

const logUrl = (context: AppContext): string => {
  const {type, number, owner, repo} = deploymentContext(context)
  const {sha} = context.gitHubContext
  if (type === 'push') {
    return `https://github.com/${owner}/${repo}/commit/${sha}/checks`
  }

  return `https://github.com/${owner}/${repo}/pull/${number}/checks`
}

export const createDeploymentStatusPayload = (
  deploymentId: number,
  context: AppContext
): Octokit.ReposCreateDeploymentStatusParams => {
  const {owner, repo} = deploymentContext(context)
  const state = context.getInput('state') as DeploymentState
  const environmentUrl = context.getInput('environmentUrl')
  return {
    owner,
    repo,
    auto_inactive: true,
    deployment_id: deploymentId,
    state,
    description: 'this is pr',
    log_url: logUrl(context),
    environment_url: environmentUrl
  }
}
