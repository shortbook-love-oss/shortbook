FROM node:22.4.0-bookworm-slim as base

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /home/node

# Develop ---------------------------------------------------
FROM base as dev

ENV NODE_ENV=development

COPY ./service-frontend/package.json .
RUN npm i

COPY ./service-frontend .
COPY ./lib-frontend ./lib

# SvelteKit(Vite) use 5173 port
EXPOSE 5173


# Production ---------------------------------------------------
FROM base as prd-builder

ENV NODE_ENV=production

# Install the same minor version
COPY ./service-frontend/package*.json .
RUN npm ci

COPY ./service-frontend .
COPY ./lib-frontend ./lib

# Production-setting build
RUN npm run build

FROM node:22.4.0-bookworm-slim as prd

RUN apt-get update -y && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /home/node

# Copy only necessary files
COPY --from=prd-builder --chown=node:node /home/node/node_modules ./node_modules
COPY --from=prd-builder --chown=node:node /home/node/package.json .
COPY --from=prd-builder --chown=node:node /home/node/build ./build

# Change node port from 3000 to 443.
ENV PORT=443

EXPOSE 443

CMD ["node", "./build"]
