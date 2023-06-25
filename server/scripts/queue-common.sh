#!/usr/bin/env bash

php artisan queue:work --queue=high,default,low --timeout=86400  --memory=512
