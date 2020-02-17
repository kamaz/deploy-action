import {app, AppContext} from '../src/app'
import {
  CreateDeploymentStatusResponse,
  CreateDeploymentResponse,
  CreateDeploymentParams,
  CreateDeploymentStatusParams
} from '../src/github-client'
import {Context} from '@actions/github/lib/context'

type MockAppContext = AppContext & {
  hasFailed: boolean
  deploymentParams: CreateDeploymentParams | undefined
  deploymentStatusParams: CreateDeploymentStatusParams | undefined
  failedMessage: string | undefined
  output: {[key: string]: string}
}

const pullRequestGitHubContext: Context = {
  payload: {
    pull_request: {
      number: 1,
      head: {
        ref: 'pull_ref'
      },
      user: ''
    }
  },
  eventName: 'pull_request',
  ref: '',
  repo: {
    owner: 'kamaz',
    repo: 'actions'
  },
  sha: 'pull_sha',
  workflow: '',
  action: '',
  actor: '',
  issue: {
    number: 1,
    owner: '',
    repo: ''
  }
}
const pushGitHubContext: Context = {
  payload: {
    ref: 'push_ref',
    pusher: {
      name: 'pusher_name'
    }
  },
  eventName: 'push',
  ref: 'push_ref',
  repo: {
    owner: 'test-owner',
    repo: 'my-repo'
  },
  sha: 'push_sha',
  workflow: '',
  action: '',
  actor: '',
  issue: {
    number: 1,
    owner: '',
    repo: ''
  }
}

const createMockAppContext = (
  inputs: {
    [key: string]: string
  },
  gitHubContext: Context
): MockAppContext => {
  return {
    output: {},
    hasFailed: false,
    failedMessage: undefined,
    deploymentParams: undefined,
    deploymentStatusParams: undefined,
    getInput(input, options) {
      return inputs[input]
    },
    setFailed(message) {
      this.hasFailed = true
      this.failedMessage = message
    },
    setOutput(name, value) {
      this.output[name] = value
    },
    info(msg) {
      //   console.log(msg)
    },
    error(msg) {
      //   console.log(msg)
    },
    async createDeployment(params) {
      this.deploymentParams = params
      return {
        data: {
          id: 1
        }
      } as CreateDeploymentResponse
    },
    async createDeploymentStatus(params) {
      this.deploymentStatusParams = params
      return {
        data: {
          deployment_url: '',
          description: '',
          environment: '',
          environment_url: '',
          id: 1,
          log_url: '',
          node_id: '',
          repository_url: '',
          state: '',
          target_url: '',
          updated_at: '',
          url: ''
        },
        headers: {},
        status: 200
      } as CreateDeploymentStatusResponse
    },
    gitHubContext
  }
}

describe('app', () => {
  // owner and repo does not work
  // https://github.com/cabiri-io/cabiri-io/commit/0acdd35f7db68e2398e6c2256c1f5e8924e9986c/checks
  it('creates deployment for pull request', async () => {
    const mockAppContext = createMockAppContext(
      {
        environmentUrl: 'https://www.example.com'
      },
      pullRequestGitHubContext
    )

    await app(mockAppContext)

    expect(mockAppContext.hasFailed).toBe(false)
    expect(mockAppContext.deploymentParams).toEqual({
      auto_merge: false,
      environment: 'pr-1',
      owner: 'kamaz',
      production_environment: false,
      ref: 'pull_ref',
      repo: 'actions',
      required_contexts: [],
      transient_environment: false
    })
    expect(mockAppContext.deploymentStatusParams).toEqual({
      deployment_id: 1,
      description: 'this is pr',
      auto_inactive: true,
      owner: 'kamaz',
      repo: 'actions',
      log_url: 'https://github.com/kamaz/actions/pull/1/checks',
      environment_url: 'https://www.example.com',
      state: undefined
    })
  })

  it('creates deployment for pull request when env is ""', async () => {
    const mockAppContext = createMockAppContext(
      {
        environmentUrl: 'https://www.example.com',
        environment: ''
      },
      pullRequestGitHubContext
    )

    await app(mockAppContext)

    expect(mockAppContext.hasFailed).toBe(false)
    expect(mockAppContext.deploymentParams).toEqual({
      auto_merge: false,
      environment: 'pr-1',
      owner: 'kamaz',
      production_environment: false,
      ref: 'pull_ref',
      repo: 'actions',
      required_contexts: [],
      transient_environment: false
    })
  })

  it('creates deployment for push to master', async () => {
    const mockAppContext = createMockAppContext(
      {
        environmentUrl: 'https://www.example.com'
      },
      pushGitHubContext
    )

    await app(mockAppContext)

    expect(mockAppContext.hasFailed).toBe(false)
    expect(mockAppContext.deploymentParams).toEqual({
      auto_merge: false,
      environment: 'qa',
      owner: 'test-owner',
      production_environment: false,
      ref: 'push_ref',
      repo: 'my-repo',
      required_contexts: [],
      transient_environment: false
    })
    expect(mockAppContext.deploymentStatusParams).toEqual({
      deployment_id: 1,
      description: 'this is pr',
      auto_inactive: true,
      owner: 'test-owner',
      repo: 'my-repo',
      log_url: 'https://github.com/test-owner/my-repo/commit/push_sha/checks',
      environment_url: 'https://www.example.com',
      state: undefined
    })
  })

  it('environment input override the default value', async () => {
    const mockAppContext = createMockAppContext(
      {
        environmentUrl: 'https://www.example.com',
        environment: 'staging'
      },
      pushGitHubContext
    )

    await app(mockAppContext)

    expect(mockAppContext.hasFailed).toBe(false)
    expect(mockAppContext.deploymentParams).toEqual({
      auto_merge: false,
      environment: 'staging',
      owner: 'test-owner',
      production_environment: false,
      ref: 'push_ref',
      repo: 'my-repo',
      required_contexts: [],
      transient_environment: false
    })
  })
})
