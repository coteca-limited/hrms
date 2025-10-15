#!/bin/sh

echo "Copy storage"
rsync -av /app/storage/* /storage

echo "Run migration"
php artisan migrate --force

echo "Clear cache"
php artisan cache:clear