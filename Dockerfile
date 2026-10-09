FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci
COPY . .
# SvelteKit 3 vérifie la PRÉSENCE des variables CONFIG_* au build, mais ne les
# intègre pas au code produit (vérifié). On met donc des valeurs factices ici :
# les vrais secrets ne sont fournis qu'au runtime par Coolify.
ENV CONFIG_STRIPE_KEY=build-placeholder \
    CONFIG_STRIPE_WEBHOOK_KEY=build-placeholder \
    CONFIG_VOSFACTURES_KEY=build-placeholder \
    CONFIG_VOSFACTURES_DOMAIN=build-placeholder \
    CONFIG_VOSFACTURES_TEST=false \
    CONFIG_ACTIVATE_KEY=build-placeholder \
    CONFIG_SMTP_HOST=build-placeholder \
    CONFIG_SMTP_PORT=build-placeholder \
    CONFIG_SMTP_USER=build-placeholder \
    CONFIG_SMTP_PASSWORD=build-placeholder \
    CONFIG_SMTP_FROM=build-placeholder
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
ENV NODE_ENV=production \
    PORT=3000
EXPOSE 3000
USER node
CMD ["node", "build"]
