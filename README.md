## Getting started

### https

```bash
brew install mkcert nss
mkcert -install
cd service-frontend
mkcert localhost
```

### Make directory and file

```bash
chmod 755 ./fix_dirname_error.sh
mkdir ./database/.data
mkdir ./cache/.data
mkdir ./cache/dynamodb
```

### Run Docker

```bash
docker compose -f docker/compose.yaml up -d --build
```

### On release

TODO: Use GitHub Action in the future.

```bash
docker build -f ./service-frontend/Dockerfile --target prd -t shortbook-service-frontend:(((version-tag))) .
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin (((your-aws-account-id-without-hyphen))).dkr.ecr.us-west-2.amazonaws.com
docker tag shortbook-service-frontend:(((version-tag))) (((your-aws-account-id-without-hyphen))).dkr.ecr.us-west-2.amazonaws.com/shortbook-service-frontend:(((version-tag)))
docker push (((your-aws-account-id-without-hyphen))).dkr.ecr.us-west-2.amazonaws.com/shortbook-service-frontend:(((version-tag)))
docker logout (((your-aws-account-id-without-hyphen))).dkr.ecr.us-west-2.amazonaws.com
```
