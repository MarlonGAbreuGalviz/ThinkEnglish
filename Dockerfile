# Etapa 1: construir el frontend React/Vite
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# Etapa 2: servir el build con Nginx
FROM nginx:alpine AS production

# Configuración interna de Nginx para aplicaciones SPA
RUN cat > /etc/nginx/conf.d/default.conf <<'EOF_NGINX'
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(?:js|css|ico|png|jpg|jpeg|gif|svg|webp|woff2?)$ {
    try_files $uri =404;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
EOF_NGINX

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
