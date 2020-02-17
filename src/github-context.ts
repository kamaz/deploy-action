import * as core from '@actions/core'

type GetInput = typeof core.getInput
type LogInfo = typeof core.info
type LogError = typeof core.error
type SetFailed = typeof core.setFailed
type SetOutput = typeof core.setOutput

export type GitHubContext = {
  getInput: GetInput
  info: LogInfo
  error: LogError
  setFailed: SetFailed
  setOutput: SetOutput
}

export const GitHubContext = {
  getInput: core.getInput,
  info: core.info,
  error: core.error,
  setOutput: core.setOutput,
  setFailed: core.setFailed
}
