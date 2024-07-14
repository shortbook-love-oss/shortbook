FROM node:22.4.1-bookworm-slim AS base

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /home/node/app

# Develop ---------------------------------------------------
FROM base AS dev

ENV NODE_ENV=development

COPY ./service-frontend/package.json .
RUN npm i

COPY ./service-frontend .
COPY ./lib-frontend ./lib

# Vite use 5173 port
EXPOSE 5173


# Production ---------------------------------------------------
FROM base AS prd-process

ENV NODE_ENV=production

COPY ./service-frontend/package*.json .

# prd-install and prd-build are run in parallel.
FROM prd-process AS prd-install

# Install prd-bundle in another directory
RUN cd ../ \
  && mkdir install \
  && cp ./app/package.json ./install/ \
  && cp ./app/package-lock.json ./install/ \
  && cd install \
  && npm ci --omit=dev

COPY ./lib-frontend/prisma/schema.prisma ../install/lib/prisma/schema.prisma

RUN cd ../install && npm run schema-generate

FROM prd-process AS prd-build

# Install the same patch version
RUN npm ci --include=dev

COPY ./service-frontend .
COPY ./lib-frontend ./lib

# Production-setting build
RUN npm run build

FROM --platform=linux/arm64 node:22.4.1-bookworm-slim AS prd

RUN apt-get update -y && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /home/node

# Copy only necessary files
COPY --chown=node:node --from=prd-install /home/node/install/node_modules ./node_modules
COPY --chown=node:node --from=prd-build /home/node/app/package.json .
COPY --chown=node:node --from=prd-build /home/node/app/build ./build

# Change node port from 3000 to 443.
ENV PORT=443

EXPOSE 443

CMD ["node", "./build"]
