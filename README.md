## What is the goals

Yeoman generators for easier upgrades of repositories. Currently works for frontend repositories.

## How to install

- `git clone [url]`
- `yarn`
- `sudo yarn install-bin`

## How to use

In the repository, run:

```
yornikar
```

or:

```
yornikar-migrate
```

## What's included

- vscode generator: generate `.vscode/settings.json` and `.vscode/extensions.json`.
- yarn berry.
- package.json "repository" field for monorepos.
