# Ubuntu Node.js
FROM node:22.12.0

WORKDIR /home/node

ENV NODE_ENV=development

RUN apt-get update -y && apt-get install -y less \
  && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
  && unzip awscliv2.zip \
  && ./aws/install -i /usr/local/aws-cli -b /usr/local/bin \
  && rm -rf aws \
  && rm -f awscliv2.zip \
  && npm i -g aws-cdk

COPY ./infrastructure/image-cdn/package.json .
RUN npm i

# Copy function code
COPY ./infrastructure/image-cdn .
COPY ./lib-backend/utilities/infrastructure ./lib-backend/utilities/infrastructure