FROM --platform=linux/amd64 node:16-alpine

# Install git
RUN apk add --no-cache git

WORKDIR /app

COPY package.json package-lock.json ./

# Remove node_modules if it exists and install dependencies
RUN rm -rf node_modules && npm install ajv-keywords@^3.5.2 schema-utils@^3.0.0 && npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
