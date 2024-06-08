## Getting started

### https

```bash
brew install mkcert nss
mkcert -install
cd service-frontend
mkcert localhost
```

### Docker

```bash
cd docker
docker compose up -d --build
```
