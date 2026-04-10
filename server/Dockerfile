# build stage
FROM node:alpine as server-build
WORKDIR /app
RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

WORKDIR /app/server
RUN pnpm i

COPY ./ ./

# prisma & server build
RUN pnpm exec prisma generate
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
