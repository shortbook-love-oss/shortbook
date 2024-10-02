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

Set this IAM policy for SES.

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

### Push docker image to remote repository

On first time:

```bash
brew install awscli
aws configure --profile shortbook
# AWS Access Key ID [None]: xxxxxxxxxxxxxxxxx
# AWS Secret Access Key [None]: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Default region name [None]: eu-west-1
# Default output format [None]: json
```

On every time:

```bash
docker buildx build --platform=linux/amd64 -f ./service-frontend/Dockerfile --target prd -t shortbook/service-frontend:(((VERSION_TAG))) . --progress=plain
aws ecr get-login-password --region eu-west-1 --profile shortbook | docker login --username AWS --password-stdin (((ACCOUNT_ID))).dkr.ecr.eu-west-1.amazonaws.com
docker tag shortbook/service-frontend:(((VERSION_TAG))) (((ACCOUNT_ID))).dkr.ecr.eu-west-1.amazonaws.com/shortbook/service-frontend:(((VERSION_TAG)))
docker tag shortbook/service-frontend:(((VERSION_TAG))) (((ACCOUNT_ID))).dkr.ecr.eu-west-1.amazonaws.com/shortbook/service-frontend:latest
docker push (((ACCOUNT_ID))).dkr.ecr.eu-west-1.amazonaws.com/shortbook/service-frontend:(((VERSION_TAG)))
docker push (((ACCOUNT_ID))).dkr.ecr.eu-west-1.amazonaws.com/shortbook/service-frontend:latest
```
