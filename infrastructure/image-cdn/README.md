# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Init

Enable STS of eu-west-1 and eu-north-1
https://us-east-1.console.aws.amazon.com/iam/home#/account_settings

Next, run docker

```bash
docker compose -f docker/compose.yaml up -d --build infra-image-cdn
```

Next, exec commands in docker container

```bash
aws configure --profile shortbook
npm i
npx cdk bootstrap aws://{AWS_ACCOUNT_ID}/us-east-1 --profile shortbook
npx cdk bootstrap aws://{AWS_ACCOUNT_ID}/eu-west-1 --profile shortbook
npx cdk bootstrap aws://{AWS_ACCOUNT_ID}/eu-north-1 --profile shortbook
npx cdk deploy {{replace to ${prefix}}}-image-cdn-cloudfront --profile shortbook
```

## Pro tip

If you want to renew code base, move another directory and exec following command.
And fit code to latest CDK template.

```bash
npx cdk init app --language typescript
```

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
