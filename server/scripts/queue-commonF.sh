#!/usr/bin/env bash

php artisan queue:work --queue=highF,defaultF,lowF --timeout=600  --memory=512
