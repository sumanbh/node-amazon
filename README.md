# Node - Amazon
[![Build Status](https://travis-ci.org/sumanbh/node-amazon.svg?branch=master)](https://travis-ci.org/sumanbh/node-amazon)

Amazon lookalike with Node, and Angular v4. Demo at: https://sumanb.com

## Requirements
You need to have **Node v7.6.0** or higher and **PostgreSQL** installed.

## Setup
1. Install dependencies
    ```
    yarn install or npm install
    ```
    
2. Config is in: ``less config/amazon.json``. Make changes there as you see fit (database user/password, OAUTH 2 etc)
    
3. You can find the database schema and inserts/seed in ```config/schema```

4. Start server after creating the database: ```yarn dev```
