# deploy action

Action is a wrapper around deployment api.

## Inputs

| Output | Value |
|-----|-----|
| token | github token |

## Outputs

| Output | Value |
| --- | --- |
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
