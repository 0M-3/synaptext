FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Using a simple server to serve the build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
