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

## On release

TODO: Use GitHub Action in the future.

```bash
docker build -f ./service-frontend/Dockerfile --target prd -t shortbook-service-frontend:(((version-tag))) .
docker tag shortbook-service-frontend:(((version-tag))) us-west1-docker.pkg.dev/(((project-id)))/shortbook-service-frontend/shortbook-service-frontend:(((version-tag)))
docker push us-west1-docker.pkg.dev/(((project-id)))/shortbook-service-frontend/shortbook-service-frontend:(((version-tag)))
```
