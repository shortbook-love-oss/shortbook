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
mkdir ./cache/dynamodb
```

### Run Docker

```bash
docker compose -f docker/compose.yaml up -d --build
```

## On release

### Check IAM policy to send email

Here is IAM policy for SES.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SESSendEmail",
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}
```

### Push repository

TODO: Use GitHub Action in the future.

```bash
docker build -f ./service-frontend/Dockerfile --target prd -t shortbook-service-frontend:(((version-tag))) . --progress=plain
docker tag shortbook-service-frontend:(((version-tag))) us-west1-docker.pkg.dev/(((project-id)))/shortbook-service-frontend/shortbook-service-frontend:(((version-tag)))
docker push us-west1-docker.pkg.dev/(((project-id)))/shortbook-service-frontend/shortbook-service-frontend:(((version-tag)))
```
