FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci
COPY . .
# Les variables CONFIG_* sont requises au build (le build échoue si elles manquent)
ARG CONFIG_STRIPE_KEY
ARG CONFIG_STRIPE_WEBHOOK_KEY
ARG CONFIG_VOSFACTURES_KEY
ARG CONFIG_VOSFACTURES_DOMAIN
ARG CONFIG_VOSFACTURES_TEST
ARG CONFIG_ACTIVATE_KEY
ARG CONFIG_MAILGUN_ID
ARG CONFIG_MAILGUN_KEY
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
ENV PORT=3000
EXPOSE 3000
CMD ["node", "build"]
