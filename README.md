# Node - Amazon
[![Build Status](https://travis-ci.org/sumanbh/node-amazon.svg?branch=master)](https://travis-ci.org/sumanbh/node-amazon)

Amazon lookalike with Node, and Angular v4. Demo at: https://sumanb.com

## Requirements
You need to have **Node** and **PostgreSQL** installed.

## Setup
1. Install dependecies and build
    ```
    yarn install or npm install
    node_modules/@angular/cli/bin/ng build --prod --aot
    ```
    
2. Config goes in: ``nano config/amazon.json``
3. Add the following:
    ```
    {
      "session": {
        "secret": "SECRET"
      },
      "jwt": {
        "secret": "SECRET"
      },
      "postgresql": {
        "user": "postgres",
        "password": "postgres",
        "host": "localhost",
        "database": "node_amazon_dev",
        "max": 10,
        "idleTimeoutMillis": 1000
      },
      "oauth": {
        "google": {
          "client": "ID",
          "secret": "SECRET",
          "callback": "http://localhost:3000/auth/google/callback"
        },
        "facebook": {
          "client": "ID",
          "secret": "SECRET",
          "callback": "http://localhost:3000/auth/facebook/callback"
        }
      }
    }
    ```
    
4. You can find the database schema and initial inserts/seed in ```server/schema```

5. Start server: ```node server/index.js``` 
