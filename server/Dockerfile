# build stage
FROM node:alpine as server-build
WORKDIR /app
RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

WORKDIR /app/server
RUN pnpm i

COPY ./ ./

# server build
RUN pnpm build

# runtime stage
FROM node:alpine
WORKDIR /app
RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
WORKDIR /app/server
RUN pnpm i

WORKDIR /app
COPY --from=server-build /app/server/dist ./dist

ENV NODE_ENV=development

EXPOSE 8000
