import {Octokit} from '@octokit/rest'
import {deploymentContext} from './deployment-context'
import {isTrue} from './converter'
import {AppContext} from './app'

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
  // const environment = context.getInput('environment') ?? 'qa'

  return {
    owner,
    repo,
    ref,
    required_contexts: requiredContext,
    environment: 'pr1',
    transient_environment: isTrue(transientEnvironment),
    auto_merge: isTrue(autoMerge),
    production_environment: isTrue(productionEnvironment)
  }
}
