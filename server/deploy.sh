#!/bin/bash
cd  https://github.com/mcc1461/mcStore
git pull origin main
npm install
pm2 restart mcStore

