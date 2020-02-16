import {app, AppContext} from '../src/app'
import {
  CreateDeploymentStatusResponse,
  CreateDeploymentResponse
} from '../src/github-client'
import {setFailed} from '@actions/core'

type MockAppContext = AppContext & {
  setFailedCalled: boolean
}

const createMockAppContext = (): MockAppContext => {
  return {
    setFailedCalled: false,
    getInput(input, options) {
      return ''
    },
    setFailed(message) {
      this.setFailedCalled = true
    },
    setOutput(name, value) {},
    info() {},
    async createDeployment(params) {
      return {} as CreateDeploymentResponse
    },
    async createDeploymentStatus() {
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
      payload: {},
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
  it('fails on invalid values', async () => {
    const mockAppContext = createMockAppContext()
    await app(mockAppContext)

    expect(mockAppContext.setFailedCalled).toBe(true)
  })
})
