FROM node:22.2.0-bookworm-slim as base

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl

COPY ./lib-frontend/package*.json .
RUN npm i

COPY ./lib-frontend .
