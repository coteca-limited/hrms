#!/bin/sh

role=${CONTAINER_ROLE:-fpm}
ENV=${APP_ENV:-local}

echo "Start service as ${CONTAINER_ROLE}"

if [ "$role" = "fpm" ]; then

    echo "[!] Starting PHP FPM"
    php-fpm
fi