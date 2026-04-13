# build stage
FROM node:alpine as server-build
WORKDIR /server
RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm i

COPY ./ ./

# server build
RUN pnpm build

# runtime stage
FROM node:alpine
WORKDIR /server

RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm i

COPY --from=server-build /server/dist ./dist

ENV NODE_ENV=development

EXPOSE 8002
