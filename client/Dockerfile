# Build the Vite client, then serve the static files with nginx.
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app

# Backend URL is baked in at build time (Vite inlines VITE_* vars).
ARG VITE_BACKEND_BASE_URL=http://localhost:8000/api/v1
# Google OAuth client ID (sign-in is Google-only).
ARG VITE_GOOGLE_CLIENT_ID=

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/validation/package.json ./packages/validation/
COPY client/package.json ./client/
RUN pnpm install --no-frozen-lockfile --prod=false
COPY packages/validation ./packages/validation
COPY client ./client
# Write build-time env so Vite picks it up, then build.
RUN printf "VITE_BACKEND_BASE_URL=%s\nVITE_GOOGLE_CLIENT_ID=%s\n" "$VITE_BACKEND_BASE_URL" "$VITE_GOOGLE_CLIENT_ID" > client/.env \
  && pnpm --filter @form-builder/validation build \
  && pnpm --filter @form-builder/client build

# --- Serve ---
FROM nginx:alpine AS production
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
