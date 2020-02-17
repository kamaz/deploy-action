import * as core from '@actions/core'
import * as Webhooks from '@octokit/webhooks'
import {AppContext} from './app'

interface DeploymentContext {
  owner: string
  repo: string
  ref: string
  login: string
  type: 'push' | 'pull_request'
  number?: number
}

export const deploymentContext = (context: AppContext): DeploymentContext => {
  const {owner, repo} = context.gitHubContext.repo
  const {eventName, payload} = context.gitHubContext
  if (eventName === 'push') {
    const {
      ref,
      pusher: {name}
    } = payload as Webhooks.WebhookPayloadPush

    return {
      owner,
      repo,
      ref,
      login: name,
      type: 'push'
    }
  } else if (eventName === 'pull_request') {
    const {pull_request} = payload as Webhooks.WebhookPayloadPullRequest
    const {ref} = pull_request.head
    const {
      user: {login}
    } = pull_request
    const {number} = pull_request
    return {
      owner,
      repo,
      ref,
      login,
      number,
      type: 'pull_request'
    }
  } else {
    const message = `unsupported event name: ${eventName}`
    core.setFailed(message)
    throw new Error(message)
  }
}
