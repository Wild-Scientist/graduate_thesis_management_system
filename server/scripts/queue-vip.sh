#!/usr/bin/env bash

php artisan queue:work --queue=vip --timeout=3600  --memory=512
