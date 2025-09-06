FROM node:18-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --production; else npm install --production; fi

FROM base AS runner

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy application source
COPY . .

# Ensure uploads directory exists and set permissions (use chown when privileged)
RUN mkdir -p uploads/avatars && chown -R node:node /app || true

USER node

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "app.js"]
