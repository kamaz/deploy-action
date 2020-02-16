import * as core from '@actions/core'
import * as Webhooks from '@octokit/webhooks'
import {AppContext} from './app'

interface DeploymentContext {
  owner: string
  repo: string
  ref: string
  login: string
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
      login: name
    }
  } else if (eventName === 'pull_request') {
    const {pull_request} = payload as Webhooks.WebhookPayloadPullRequest
    const {ref} = pull_request.head
    const {
      user: {login}
    } = pull_request
    return {
      owner,
      repo,
      ref,
      login
    }
  } else {
    const message = `unsupported event name: ${eventName}`
    core.setFailed(message)
    throw new Error(message)
  }
}
