import {GitHub} from '@actions/github'
import {Octokit} from '@octokit/rest'
import {GitHubContext} from './github-context'
import {throttling} from '@octokit/plugin-throttling'
import {retry} from '@octokit/plugin-retry'

Octokit.plugin([throttling, retry])

export type CreateDeploymentParams = Octokit.ReposCreateDeploymentParams
export type CreateDeploymentStatusParams = Octokit.ReposCreateDeploymentStatusParams

export type CreateDeploymentResponse = Octokit.Response<
  Octokit.ReposCreateDeploymentResponse
>

export type CreateDeployment = (
  params: CreateDeploymentParams
) => Promise<CreateDeploymentResponse>

export type CreateDeploymentStatusResponse = Octokit.Response<
  Octokit.ReposCreateDeploymentStatusResponse
>

export type CreateDeploymentStatus = (
  params: CreateDeploymentStatusParams
) => Promise<CreateDeploymentStatusResponse>

export type GitHubClient = {
  createDeployment: CreateDeployment
  createDeploymentStatus: CreateDeploymentStatus
}

export const createGitHubClient = (context: GitHubContext): GitHubClient => {
  const githubToken = context.getInput('token')
  const octokit = new GitHub(githubToken, {previews: ['flash', 'ant-man']})
  console.log('')
  return {
    async createDeployment(deployment) {
      return octokit.repos.createDeployment(deployment)
    },
    async createDeploymentStatus(deploymentStatus) {
      return octokit.repos.createDeploymentStatus(deploymentStatus)
    }
  }
}
