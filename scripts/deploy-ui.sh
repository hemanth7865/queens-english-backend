#!/bin/bash

cd /home/qeuser/qe-backend/qe-admin && npm run build
rm -rf /var/www/html/qe-admin && cp -r /home/qeuser/qe-backend/qe-admin/dist /var/www/html/qe-admin