[![codecov](https://codecov.io/gh/pshaddel/redbull/graph/badge.svg?token=NDKG441UN0)](https://codecov.io/gh/pshaddel/redbull)
![Maintaner](https://img.shields.io/badge/maintainer-Poorshad-blue)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pshaddel/redbull/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange.svg)](https://github.com/pshaddel/redbull/compare)

# RedBull Case Study

## Prerequisites
Nodejs and NPM: You can install the latest version [here](https://nodejs.org/en/download)
docker: Install docker engine from [here](https://docs.docker.com/get-docker/).
docker-compose: installation from [here](https://docs.docker.com/compose/install/)

## Quick Start

### Development
First install dependencies:
```bash
npm install
```
And then start the project:

Put these variables in a `.env` file at the root of the project:
```bash
DATABASE_URL=mongodb://user:password@127.0.0.1:27017/database
PIXABAY_API_KEY=YOUR_KEY
TEST_ARGON_HASH=$argon2id$v=19$m=65536,t=3,p=4$bG9uZ2VyX3NlY3JldA$7ImNgJ6BLAKruqwzKN5lYX0hb4+aXW7NN9LSSAQ98ko
HASH_SALT=longer_secret
HASH_SECRET=longer_secret
REDIS_PASSWORD=password123
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=password123
PORT=3001
```
Change `PIXABAY_API_KEY` to your own key.
```bash
npm run start:dev
```

It also automatically creates a private and public key in the root of the project so you can use authentication using jwt.

Now the service is up and is listening on: `http://127.0.0.1:3001`

### Testing

We are using [Jest](https://jestjs.io/) as both test library and test runner. For running ts test files we are using [SWC](https://swc.rs/docs/usage/jest) which is a lot faster than [TS-NODE](https://github.com/TypeStrong/ts-node).
```bash
npm run test
npm run test:watch
npm run test:ci
```
Do the development step before running the tests. There is before script that runs docker-compose file and the tests have access to the database.

### Test Coverage Badge
Test coverage badge is updated with each push

### Deploy
run:
```
npm install
```
and then
```
npm run deploy
```
<b>This is just for testing, the hash secret and passwords should be replaced with k8s secrets in case of production usage</b>
It runs all the needed containers including the node application on port 3000. 
You have to have `PIXABAY_API_KEY`, and as a env variable or directly set it into the deploy.yml file.
## Technology and Tools
#### Linter
For Linting we are using [ESLint](https://eslint.org/)
```bash
npm run lint
```
#### Formatter
For Formatting we are using [Prettier](https://prettier.io/).
```bash
npm run prettier
```
#### Git Commit Message
It is forced to commit [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) to this repository. For commiting in this style you can use this [VSCode Extension](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits) or use this [CLI Tool](https://github.com/pshaddel/homebrew-conventionalcommit) that I implemented.
#### Husky
For formatting and linting before commit and also testing commit message standard.
#### Validation
We are using [Zod](https://zod.dev/) for validation of requests.
#### MongoDB
As a nosql database it was a good choice in here, even if we have millions of users with a lot of favorite contents there should be no problem.
#### Redis
I have used it for caching the requests that we are sending to Pixaboy, Pixaboy data is updated only once in a 24h, I am also caching the result so we do not need to pay for anything if we have are sending the same request.
#### Express
Quite Standard library, very mature without security issues.
#### Logger
We are using winston for adding logs to the project.

## Pipeline

### CI
Pipeline has these steps:

- Installing Dependencies
- Lint
- Run Test Containers
- Wait
- Test
- Add Test Coverage Badge
### Publish Docker Image
On this one I am building the application docker and push it to docker registry and we can use this image in docker or k8s

### Architechture
We have a modular monolith, each module consist of a `route.ts`, `service.ts` and a `model.ts` for separating the concerns.

We have integration tests for everything. For some uses cases there are also unit tests for small functions.

#### Authentication
- username validation
- password validation
- jwt for access_token and refresh_token
- hashing using argon
- login
- register
- logout
- ddos
- brute
- timing attack
- not passing extra information
- using http only cookies

#### Content
- search image
- search video
- get favorites
- add favorites
- remove favorites
- memoize function for using redis

We have login and register inside users module. but some functions which are purely related to authentication are moved to authentication module.


