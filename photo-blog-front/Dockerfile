# Stage 1
FROM node:24-alpine AS node
WORKDIR /app
COPY . .
RUN npm ci --no-audit --no-fund
RUN npm run build
# Stage 2
FROM nginx:alpine
RUN mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf_orig
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/security-headers.conf /etc/nginx/security-headers.conf

EXPOSE 80
COPY --from=node /app/dist/photo-blog-front/browser /usr/share/nginx/html
