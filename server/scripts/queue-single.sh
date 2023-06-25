#!/usr/bin/env bash

php artisan queue:work --queue=single --timeout=86400  --memory=512
