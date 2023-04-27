# Stage 1
FROM node:16-alpine as node
WORKDIR /app
COPY . .
RUN npm install --dev
RUN npm run build
# Stage 2
FROM nginx:alpine
EXPOSE 80
COPY --from=node /app/dist/photo-blog-front /usr/share/nginx/html