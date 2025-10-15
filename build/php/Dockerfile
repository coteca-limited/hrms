FROM php:8.2-fpm-alpine3.22 as php

ARG PHP_MEMORY_LIMIT=128M
ARG PHP_OPCACHE_ENABLED=0

ARG PM_START_SERVERS=2
ARG PM_MAX_CHILDREN=5
ARG PM_MIN_SPARE_SERVERS=1
ARG PM_MAX_SPARE_SERVERS=3
ARG PM_MAX_REQUEST=1000

# PHP CONFIG (MODIFY compose.yaml)
ENV PHP_MEMORY_LIMIT=$PHP_MEMORY_LIMIT
ENV PHP_OPCACHE_ENABLED=$PHP_OPCACHE_ENABLED

# FPM CONFIG (MODIFY compose.yaml)
ENV PM_START_SERVERS=$PM_START_SERVERS
ENV PM_MAX_CHILDREN=$PM_MAX_CHILDREN
ENV PM_MIN_SPARE_SERVERS=$PM_MIN_SPARE_SERVERS
ENV PM_MAX_SPARE_SERVERS=$PM_MAX_SPARE_SERVERS
ENV PM_MAX_REQUEST=$PM_MAX_REQUEST

ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN set -eux \
    && apk add --no-cache \
    unzip \
    zip \
    git \
    curl \
    dos2unix \
    nodejs \
    npm \
    redis \
    ca-certificates \
    && chmod +x /usr/local/bin/install-php-extensions \
    && install-php-extensions gd zip pdo_mysql exif opcache redis intl

RUN addgroup -g 1000 -S kdock \
    && adduser -u 1000 -D -G kdock kdock

RUN apk add \
    --no-cache \
    --repository http://dl-3.alpinelinux.org/alpine/edge/community/ --allow-untrusted \
    --virtual .shadow-deps \
    shadow \
    && groupmod -o -g 1000 www-data \
    && usermod -o -u 1000 -g www-data www-data \
    && apk del .shadow-deps

# Use default PHP production configuration
RUN mv $PHP_INI_DIR/php.ini-production $PHP_INI_DIR/php.ini

# Override with custom PHP settings
COPY ./build/php/local.ini $PHP_INI_DIR/conf.d/local.ini

# Override php-fpm
COPY ./build/php/fpm.conf /usr/local/etc/php-fpm.d/zz-fpm.conf

# Add composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN mkdir -p /var/www/.composer \
    && chown kdock:kdock -R /var/www/.composer

COPY ./build/php/init.sh /
RUN dos2unix /init.sh && chmod +x /init.sh

COPY ./build/php/entrypoint.sh /
RUN dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

# Set working directory
WORKDIR /app

ENTRYPOINT ["/bin/sh", "-c"]

CMD ["/entrypoint.sh"]

#
# Production build
#
FROM php as production

ARG COMPOSER_AUTH

COPY ./src/composer.json /app/composer.json
COPY ./src/composer.lock /app/composer.lock

# Install dependencies using Composer
RUN composer install --no-cache --no-interaction --prefer-dist --no-plugins --no-scripts --no-dev --no-autoloader --ansi

# Copy existing application directory contents and change
# ownership of the application files
COPY ./src /app

# Finish composer
RUN composer dump-autoload --no-dev --optimize --ansi

#RUN php artisan route:cache
RUN php artisan view:cache

RUN chown -R kdock:kdock /app