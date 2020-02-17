import {createDeploymentPayload} from './deployment-payload'
import {createDeploymentStatusPayload} from './deployment-status-payload'
import {GitHubClient} from './github-client'
import {GitHubContext} from './github-context'
import {Context} from '@actions/github/lib/context'

export type AppContext = GitHubContext &
  GitHubClient & {
    gitHubContext: Context
  }

export const app = async (context: AppContext): Promise<void> => {
  try {
    let deploymentId = parseInt(context.getInput('deploymentId'), 10)
    context.info(`Deployment id ${deploymentId}`)

    if (isNaN(deploymentId)) {
      const deploymentPayload = createDeploymentPayload(context)
      const deployment = await context.createDeployment(deploymentPayload)
      deploymentId = deployment.data.id
      context.info(`Created deployment id: ${deploymentId}`)
    }

    const deploymentStatusPayload = createDeploymentStatusPayload(
      deploymentId,
      context
    )
    const deploymentStatus = await context.createDeploymentStatus(
      deploymentStatusPayload
    )

    context.info(`Created deployment status: ${deploymentStatus.data.id}`)

    context.setOutput('deploymentId', `${deploymentId}`)
  } catch (error) {
    context.error(error.message)
    context.setFailed(error.message)
  }
}
