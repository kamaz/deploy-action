import * as core from '@actions/core'
import {GitHub, context} from '@actions/github'
import {Octokit} from '@octokit/rest'

import * as Webhooks from '@octokit/webhooks'

type DeploymentState = Octokit.ReposCreateDeploymentStatusParams['state']

interface DeploymentContext {
  owner: string
  repo: string
  ref: string
  login: string
}

const deploymentContext = (): DeploymentContext => {
  const {owner, repo} = context.repo
  if (context.eventName === 'push') {
    const {
      ref,
      pusher: {name}
    } = context.payload as Webhooks.WebhookPayloadPush

    return {
      owner,
      repo,
      ref,
      login: name
    }
  } else if (context.eventName === 'pull_request') {
    const {pull_request} = context.payload as Webhooks.WebhookPayloadPullRequest
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
    const message = `unsupported event name: ${context.eventName}`
    core.setFailed(message)
    throw new Error(message)
  }
}

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('token')
    const environmentUrl = core.getInput('environmentUrl')
    const requiredContext = core.getInput('requiredContext')
    let deploymentId = core.getInput('deploymentId')

    const octokit = new GitHub(githubToken, {})
    const {login, owner, ref, repo} = deploymentContext()

    if (deploymentId === '') {
      const deploy = await octokit.repos.createDeployment({
        owner,
        repo,
        ref,
        required_contexts: requiredContext.split(','),
        payload: JSON.stringify({
          user: login,
          environment: 'qa',
          description: 'deploying my lovely branch'
        }),
        environment: 'qa',
        transient_environment: true,
        auto_merge: false,
        production_environment: false
      })
      deploymentId = `${deploy.data.id}`
    }

    const state = core.getInput('state') as DeploymentState

    const {sha} = context
    const logUrl = `https://github.com/${owner}/${owner}/commit/${sha}/checks`
    const deploymentStatus = await octokit.repos.createDeploymentStatus({
      owner,
      repo,
      deployment_id: parseInt(deploymentId, 10),
      state,
      description: 'this is pr',
      log_url: logUrl,
      environment_url: environmentUrl
    })

    core.debug(`Created deployment status: ${deploymentStatus.data.id}`)

    core.setOutput('deploymentId', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
