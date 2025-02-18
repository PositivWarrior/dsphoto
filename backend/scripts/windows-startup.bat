@echo off
cd /d %~dp0\..
pm2 delete dsphoto-api
pm2 start ecosystem.config.cjs
pm2 save 