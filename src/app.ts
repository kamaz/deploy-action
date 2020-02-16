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
      const deploy = await context.createDeployment(deploymentPayload)
      deploymentId = deploy.data.id
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
    context.setFailed(error.message)
  }
}
