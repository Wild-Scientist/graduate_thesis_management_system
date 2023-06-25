#!/usr/bin/env bash

php artisan queue:work --queue=vipf --timeout=300  --memory=512
