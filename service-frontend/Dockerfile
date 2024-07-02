FROM node:22.3.0-bookworm-slim as base

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl

# Include devDependencies for build
COPY ./service-frontend/package*.json .
RUN npm ci

COPY ./service-frontend .
COPY ./lib-frontend ./lib

# Production-setting build
ENV NODE_ENV=production
RUN npm run build

FROM base as dev

ENV NODE_ENV=development

# SvelteKit(Vite) use 5173 port
EXPOSE 5173

FROM node:22.3.0-bookworm-slim as prd

WORKDIR /usr/src/app

# Copy only necessary files
COPY --from=base --chown=nonroot:nonroot /usr/src/app/build ./build
COPY --from=base --chown=nonroot:nonroot /usr/src/app/package.json .

# Node use 3000 port
EXPOSE 3000

CMD ["node", "./build"]
