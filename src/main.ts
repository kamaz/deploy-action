import {app} from './app'
import {createGitHubClient} from './github-client'
import {GitHubContext} from './github-context'
import {context} from '@actions/github'

app({
  ...GitHubContext,
  ...createGitHubClient(GitHubContext),
  gitHubContext: context
})
