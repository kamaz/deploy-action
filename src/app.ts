import {createDeploymentPayload} from './deployment-payload'
import {
  createDeploymentStatusPayload,
  DeploymentState
} from './deployment-status-payload'
import {Octokit} from '@octokit/rest'
import {GitHubClient} from './github-client'
import {GitHubContext} from './github-context'
import {Context} from '@actions/github/lib/context'

export type AppContext = GitHubContext &
  GitHubClient & {
    gitHubContext: Context
  }

const getDeploymentId = (context: AppContext): number => {
  return parseInt(context.getInput('deploymentId'), 10)
}

const isInactive = (context: AppContext): boolean => {
  const state = context.getInput('state') as DeploymentState
  const deploymentId = getDeploymentId(context)

  return state === 'inactive' && isNaN(deploymentId)
}

const createDeploymentStatus = async (
  deploymentId: number,
  context: AppContext
): Promise<void> => {
  const deploymentStatusPayload = createDeploymentStatusPayload(
    deploymentId,
    context
  )

  const deploymentStatus = await context.createDeploymentStatus(
    deploymentStatusPayload
  )

  context.info(`Created deployment status: ${deploymentStatus.data.id}`)
}

const hasInactiveStatus = (
  status: Octokit.ReposListDeploymentStatusesResponse
): boolean => status.some(d => d.state === 'inactive')

export const app = async (context: AppContext): Promise<void> => {
  try {
    let deploymentId: number
    if (isInactive(context)) {
      const deployments = await context.listDeployments()

      for (const deployment of deployments.data) {
        const status = await context.request<
          Octokit.ReposListDeploymentStatusesResponse
        >(deployment.statuses_url)
        if (!hasInactiveStatus(status.data)) {
          await createDeploymentStatus(deployment.id, context)
        }
      }
    } else {
      deploymentId = getDeploymentId(context)
      context.info(`Deployment id ${deploymentId}`)

      if (isNaN(deploymentId)) {
        const deploymentPayload = createDeploymentPayload(context)
        const deployment = await context.createDeployment(deploymentPayload)
        deploymentId = deployment.data.id
        context.info(`Created deployment id: ${deploymentId}`)
      }

      await createDeploymentStatus(deploymentId, context)
      context.setOutput('deploymentId', `${deploymentId}`)
    }
  } catch (error) {
    context.error(error.message)
    context.setFailed(error.message)
  }
}
