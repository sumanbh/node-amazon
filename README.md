# Node - Amazon
[![Build Status](https://travis-ci.org/sumanbh/node-amazon.svg?branch=master)](https://travis-ci.org/sumanbh/node-amazon)

Amazon lookalike with Node, and Angular v4. Demo at: https://sumanb.com

## Requirements
You need to have **Node** and **PostgreSQL** installed.

## Setup
1. Install dependencies and build
    ```
    yarn install or npm install
    yarn build or npm run build (use build-prod for AOT)
    ```
    
2. Config is in: ``less config/amazon.json``. Make changes there as you see fit (database user/password, Google/Facebook OAUTH2 app key etc)
    
3. You can find the database schema and inserts/seed in ```server/schema```

4. Start server after creating the database: ```node server/index.js```
