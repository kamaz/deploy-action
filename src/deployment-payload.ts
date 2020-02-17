import {Octokit} from '@octokit/rest'
import {deploymentContext} from './deployment-context'
import {isTrue} from './converter'
import {AppContext} from './app'

const envName = (context: AppContext): string => {
  const {type, number} = deploymentContext(context)
  const environment = context.getInput('environment')
  context.info(`env name is: ${environment}`)
  if (environment && environment !== '') {
    return environment
  }

  return type === 'push' ? 'qa' : `pr-${number}`
}

export const createDeploymentPayload = (
  context: AppContext
): Octokit.ReposCreateDeploymentParams => {
  const {owner, ref, repo} = deploymentContext(context)
  const requiredContext = (context.getInput('requiredContext') ?? '')
    .split(',')
    .filter(x => x !== '')
  const autoMerge = context.getInput('autoMerge')
  const transientEnvironment = context.getInput('transientEnvironment')
  const productionEnvironment = context.getInput('productionEnvironment')
  const environment = context.getInput('') ?? envName(context)

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
