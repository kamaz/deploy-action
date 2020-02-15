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

const isTrue = (value: string): boolean => value === 'true'

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

const createDeploymentPayload = (): Octokit.ReposCreateDeploymentParams => {
  const {owner, ref, repo} = deploymentContext()
  const requiredContext = core
    .getInput('requiredContext')
    .split(',')
    .filter(x => x !== '')
  const autoMerge = core.getInput('autoMerge')
  const transientEnvironment = core.getInput('transientEnvironment')
  const productionEnvironment = core.getInput('productionEnvironment')
  const environment = core.getInput('environment')

  return {
    owner,
    repo,
    ref,
    required_contexts: requiredContext,
    environment,
    transient_environment: isTrue(transientEnvironment),
    auto_merge: isTrue(autoMerge),
    production_environment: isTrue(productionEnvironment)
  }
}

const createDeploymentStatusPayload = (
  deploymentId: number
): Octokit.ReposCreateDeploymentStatusParams => {
  const {owner, repo} = deploymentContext()
  const state = core.getInput('state') as DeploymentState
  const environmentUrl = core.getInput('environmentUrl')
  const {sha} = context
  const logUrl = `https://github.com/${owner}/${owner}/commit/${sha}/checks`
  return {
    owner,
    repo,
    deployment_id: deploymentId,
    state,
    description: 'this is pr',
    log_url: logUrl,
    environment_url: environmentUrl
  }
}
async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('token')
    let deploymentId = parseInt(core.getInput('deploymentId'), 10)

    core.debug(`Deployment id ${deploymentId}`)
    core.info(`Deployment id ${deploymentId}`)

    const octokit = new GitHub(githubToken, {})

    if (isNaN(deploymentId)) {
      const deploy = await octokit.repos.createDeployment(
        createDeploymentPayload()
      )
      deploymentId = deploy.data.id
      core.info(`Created deployment id: ${deploymentId}`)
    }

    const deploymentStatus = await octokit.repos.createDeploymentStatus(
      createDeploymentStatusPayload(deploymentId)
    )

    core.info(`Created deployment status: ${deploymentStatus.data.id}`)

    core.setOutput('deploymentId', `${deploymentId}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
