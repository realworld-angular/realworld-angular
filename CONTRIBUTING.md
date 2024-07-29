# Contribution Guide

Welcome to the contribution guide for the RealWorld Angular project! We are excited to have you here. This guide will help you get started with contributing to the project. We appreciate your help in making this project better.

## Code of Conduct

Please read and follow our [Code of Conduct](https://github.com/realworld-angular/realworld-angular?tab=coc-ov-file) to ensure a welcoming and inclusive environment.

## Contribution opportunities

There are many ways to contribute to the project. Here are some ideas to get you started:

- **Bug reports**: If you find a bug in the project, please report to the [Found a bug?](#found-a-bug) section.
- **Feature requests**: If you have a feature request, please report to the [Missing a feature?](#missing-a-feature) section.
- **Documentation**: If you find a typo, please open a pull request to fix it. If you want to improve the documentation, firstly open an issue to track the changes.
- **Triaging issues**: If you have some spare time, you can help by triaging issues. This will help to keep the project organized and ensure that issues are addressed promptly.
- **Review pull requests**: If you don't have time to contribute with code, you can help by reviewing pull requests. Your feedback is valuable to ensure the quality of the project.
- **Spread the word**: If you like the project, please share it with your friends and colleagues. The more people know about the project, the more likely it is to grow.
- **Donate**: If you want to support the project financially, you can [donate](https://buymeacoffee.com/geromegrignon) to the maintainers. This will help to cover the project's costs and ensure its sustainability.
- **Feedback**: If you have any feedback about the project, please open a discussion in the [Discussions](https://github.com/orgs/realworld-angular/discussions). Your feedback is essential to improve the project.
- **Other**: If you have any other idea to contribute to the project, please let us know. We are open to new ideas and suggestions.

## Got a question or problem?

[GitHub issues](https://github.com/realworld-angular/realworld-angular/issues) is the best place for bug reports and feature requests.
If you have some other question not required to be tracked in the issues, please open a discussion in the [Discussions](https://github.com/orgs/realworld-angular/discussions).

## Found a bug?

If you find a bug in the project, please firstly check if it's tracked in the [GitHub issues](https://github.com/realworld-angular/realworld-angular/issues).

If there is already an issue for the bug, please add a comment to the existing issue if you have some additional information to help in solving it.
If there is no issue for the bug, please create a new issue [here](https://github.com/realworld-angular/realworld-angular/issues/new/choose).

### Submission Guidelines

Fill the issue template with the required information. The more information you provide, the easier it will be to reproduce and fix the bug.
Open-source communication is asynchronous by nature, so the more complete is each issue, the more likely it is to be addressed quickly.

## Missing a feature?

If you have a feature request, please firstly check if it's tracked in the [GitHub issues](https://github.com/realworld-angular/realworld-angular/issues).

If there is already an issue for the bug, feel free to comment it with your thoughts. A fresh perspective is always welcome.
If there is no issue for the feature, please create a new issue [here](https://github.com/realworld-angular/realworld-angular/issues/new/choose).

We encourage you to wait for feedback from the maintainers before starting to work on the feature. This will help to avoid duplicated work and ensure that the feature fits the project's goals.

### Submission Guidelines

Fill the issue template with the required information. The more information you provide, the easier it will be to understand your request and evaluate its feasibility.
Open-source communication is asynchronous by nature, so the more complete is each issue, the more likely it is to be addressed quickly.

## Contribute to an existing issue

If you want to contribute to an existing issue, please check the issue's comments to see if someone is already working on it. If not, feel free to ask if you can help.
Once assigned, you can start working on the issue. Please follow the guidelines provided by the maintainers and make sure to respect the project's coding standards.

> If you are already assigned an issue, keep focused on it. If you want to work on another issue, please ask for reassignment.

### Get a copy of the project

To contribute to the project, you need to fork the repository and clone it to your local machine. You can find more information on how to do it [here](https://docs.github.com/en/get-started/quickstart/fork-a-repo).

### Create a branch

Before starting to work on a new feature or bug fix, create a new branch. This will help to keep your changes isolated from the main branch and make it easier to review your changes.

```bash
git checkout -b feature/my-new-feature
```

### Make your changes

Once you have created a new branch, you can start making your changes. Make sure to follow the project's coding standards and guidelines.
Ask for any details in the GitHub Issue to help you fully understand the issue you are working on.
Feel free to commit your changes as you progress and to open a [draft pull request](https://github.blog/2019-02-14-introducing-draft-pull-requests/) to get feedback from the maintainers.

> Running out of time to contribute is perfectly fine. Just let us know in the issue comments, and we can assign the issue to someone else.

### Commit your changes

After you have made your changes, commit them to your branch. Make sure to write a clear and concise commit message that explains the changes you have made.

```bash
git commit -m "feat(api): add a new feature"
```

### Commit message guidelines

Use the following format with a type, a scope and a short summary:

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. present tense and imperative mood ("Add feature" not "Added feature")
  │       │
  │       └─⫸ Commit Scope: docs|api|api-testing
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```


### Push your changes

After you have committed your changes, push them to your fork on GitHub. This will make your changes available for a pull request.

```bash
git push origin feature/my-new-feature
```

### Open a pull request

Once you have pushed your changes to your fork on GitHub, you can open a [pull request](https://github.com/realworld-angular/realworld-angular/pulls). Make sure to fill the pull request template with the required information.

### Submission Guidelines

Fill the pull request template with the required information. The more information you provide, the easier it will be to review your changes.
Open-source communication is asynchronous by design, so the more complete is each pull request, the more likely it is to be reviewed quickly.

## Development Setup

This repository is using Turbo monorepo and includes the following applications. Each application has its own README file with instructions to run them locally:

- [apps/docs](apps/old-docs/README.md): The documentation website
- [apps/api](./apps/api/README.md): The API server
- [app/api-testing](./apps/api-testing/README.md): The API testing suite

> The frontend application is in a [dedicated repository](https://github.com/realworld-angular/realworld-angular-template) as exposed as a template.


## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project:

- News (apps/docs/src/content/docs/news): [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
- Code: Apache 2.0
