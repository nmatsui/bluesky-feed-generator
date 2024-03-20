# build stage
FROM node:20.11-slim AS builder
WORKDIR /build
COPY . /build

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y build-essential python3 && \
    npm install && npm run build

# production stage
FROM node:20.11-slim AS production
WORKDIR /app

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends tini
COPY --chown=node:node --from=builder /build/dist /app
COPY --chown=node:node --from=builder /build/package.json /app/package.json
COPY --chown=node:node --from=builder /build/.env /app/.env

RUN npm install --omit=dev

ENV NODE_ENV production
USER node
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "/app/index.js"]

