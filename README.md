# 📝 release-notes-generator

A GitHub release notes generator based on your project's cards.

## Getting Started

### Install

We assume that you already have `node v14.0.0` or higher installed.

To install rng just run:

```
npm i -g rng-cli
```

Or if you prefer:

```
yarn global add rng-cli
```

## Usage

Run `rng --help` to see all available parameters.

### Available parameters
- `-o, --organizationName`: The name of the GitHub organization where your project is placed.
- `-p, --projectNumber`: The number of the project in which your cards are beeing shown. This number can be found at the URL of the project.
- `-t, --token`: Your personal token. Don't forget to give `org` and `repo` admin permission.
- `-l, --label`: Pass any valid label if you want to filter your return with one.
- `-c, --column`: Pass the name of the colon that you want to use to generate the data. This is required.
- `-r, --repository`: Pass the name of the repository that you want to filter cards.
- `-s, --isSorted`: Use to asc sort by card issue number.
- `-m, --milestone`: Pass any valid milestone if you want to filter your return with one. The default value is null, when null return all cards. If you only want to return cards that do not have a milestone, send `__NONE__` as parameter.
