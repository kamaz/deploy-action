import {app, AppContext} from '../src/app'
import {
  CreateDeploymentStatusResponse,
  CreateDeploymentResponse,
  CreateDeploymentParams,
  CreateDeploymentStatusParams
} from '../src/github-client'

type MockAppContext = AppContext & {
  hasFailed: boolean
  deploymentParams: CreateDeploymentParams | undefined
  deploymentStatusParams: CreateDeploymentStatusParams | undefined
  failedMessage: string | undefined
  output: {[key: string]: string}
}

const createMockAppContext = (inputs: {
  [key: string]: string
}): MockAppContext => {
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
    gitHubContext: {
      payload: {
        pull_request: {
          number: 1,
          head: {
            ref: ''
          },
          user: ''
        }
      },
      eventName: 'pull_request',
      ref: '',
      repo: {
        owner: '',
        repo: ''
      },
      sha: '',
      workflow: '',
      action: '',
      actor: '',
      issue: {
        number: 1,
        owner: '',
        repo: ''
      }
    }
  }
}

describe('app', () => {
  it('creates deployment', async () => {
    const mockAppContext = createMockAppContext({
      environmentUrl: 'https://www.example.com'
    })

    await app(mockAppContext)

    expect(mockAppContext.hasFailed).toBe(false)
    expect(mockAppContext.deploymentParams).toEqual({
      auto_merge: false,
      environment: 'qa',
      owner: '',
      production_environment: false,
      ref: '',
      repo: '',
      required_contexts: [],
      transient_environment: false
    })
    expect(mockAppContext.deploymentStatusParams).toEqual({
      deployment_id: 1,
      description: 'this is pr',
      auto_inactive: true,
      owner: '',
      repo: '',
      log_url: 'https://github.com///commit//checks',
      environment_url: 'https://www.example.com',
      state: undefined
    })
  })
})
