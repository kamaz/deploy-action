# deploy action

Action is a wrapper around deployment api.

For detail documentation and explanation refer to:

- [GitHub Deployments API](https://developer.github.com/v3/repos/deployments/)
- [GitHub Deployments API Create Deployment Section](https://developer.github.com/v3/repos/deployments/#create-a-deployment)
- [GitHub Deployments API Create Deployment Status Section](https://developer.github.com/v3/repos/deployments/#create-a-deployment-status)

## Inputs

| Input                 | Optional | Default | Description            |
| --------------------- | -------- | ------- | ---------------------- |
| token                 | No       | -       | github token           |
| deploymentId          | Yes      | Empty   |                        |
| state                 | Yes      | pending |                        |
| environmentUrl        | Yes      | -       |                        |
| requiredContext       | Yes      | Empty   | Format 'value1,value2' |
| autoMerge             | Yes      | false   |                        |
| environment           | Yes      | qa      |                        |
| transientEnvironment  | Yes      | true    |                        |
| productionEnvironment | Yes      | false   |                        |

## Outputs

| Output       | Value                                                    |
| ------------ | -------------------------------------------------------- |
| deploymentId | a deployment number that can be used to set status later |

## Example usage

```yaml
- uses: kamaz/deploy-action@v1.0
  id: deployment
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    environmentUrl: ${{ format('https://pr-{0}.example.com', github.event.number) }}
#   
# Your deployment steps
# 
- uses: kamaz/deploy-action@v1.0
  if: success()
  with:
    deploymentId: ${{ steps.deployment.outputs.deploymentId }}
    token: ${{ secrets.GITHUB_TOKEN }}
    environmentUrl: ${{ format('https://pr-{0}.example.com', github.event.number) }}
    state: success
- uses: kamaz/deploy-action@v1.0
  if: failure()
  with:
    deploymentId: ${{ steps.deployment.outputs.deploymentId }}
    token: ${{ secrets.GITHUB_TOKEN }}
    environmentUrl: ${{ format('https://pr-{0}.example.com', github.event.number) }}
    state: failure
```
