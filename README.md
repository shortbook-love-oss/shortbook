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
