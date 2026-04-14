# build stage
FROM node:alpine as server-build
WORKDIR /server
RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm i

COPY ./ ./

# prisma & server build
RUN pnpm exec prisma generate
RUN pnpm build

# runtime stage
FROM node:alpine
WORKDIR /server

RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm i

COPY prisma/ ./prisma/
COPY prisma.config.js ./
COPY --from=server-build /server/generated ./generated
COPY --from=server-build /server/dist ./dist

ENV NODE_ENV=development

EXPOSE 8002
