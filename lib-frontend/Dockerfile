FROM node:22.2.0-bookworm-slim as base

WORKDIR /usr/src/app

COPY ./lib-frontend/package*.json .
RUN npm i

COPY ./lib-frontend .
