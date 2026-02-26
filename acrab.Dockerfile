FROM node:24-slim

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY apps ./apps
COPY packages ./packages

RUN npm install

# Copy the rest of the source code
COPY . .

# Next.js collects telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

CMD ["npm", "run", "dev"]
