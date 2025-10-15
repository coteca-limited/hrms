FROM nginx:1.29-alpine-slim as nginx

ARG DOMAIN=_

ENV DOMAIN=$DOMAIN

COPY ./build/nginx/default.conf /etc/nginx/templates/default.conf.template
COPY ./build/nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]

#
# Production build
#
FROM nginx as production

COPY ./app /app