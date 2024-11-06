# vmmeter-action

This action installs vmmeter by the actuated team for right-sizing GitHub Actions VMs using hosted or [actuated](https://actuated.dev) runners.

Don't guestimate how much RAM, CPU and Disk are required for your jobs, measure it instead, and fine-tune the settings.

See also: [Right sizing VMs for GitHub Actions](https://actuated.com/blog/right-sizing-vms-github-actions).

## Usage

```yaml
        steps:
        - uses: alexellis/setup-arkade@master
        - uses: self-actuated/vmmeter-action@master
```

## Inputs via `with`:

* `createSummary` - defaults to `true` and adds the results to the job summary, if set to false, the results will be printed to the console only.
