# Angular - Amazon
[![Build Status](https://travis-ci.org/sumanbh/amazon-angular.svg?branch=master)](https://travis-ci.org/sumanbh/amazon-angular)

Amazon lookalike with Angular v4, node, and Postgresql. Demo at: https://sumanb.com

## Setup
1. Clone and install dependencies
    ```
    git clone https://github.com/sumanbh/amazon-angular.git
    cd amazon-angular
    yarn install or npm install
    node_modules/@angular/cli/bin/ng build --prod --aot
    ```
    
2. Config goes in: ``nano config/amazon.json``
3. Add the following:
    ```
    {
      "session": {
        "secret": "SESSION_SECRET"
      },
      "jwt": {
        "secret": "JWT_SECRET"
      },
      "postgresql": {
        "user": "USER",
        "password": "PASSWORD",
        "host": "localhost",
        "database": "DB",
        "max": 10,
        "idleTimeoutMillis": 1000
      },
      "oauth": {
        "google": {
          "client": "ID",
          "secret": "SECRET",
          "callback": "URL"
        },
        "facebook": {
          "client": "ID",
          "secret": "SECRET",
          "callback": "URL"
        }
      }
    }
    ```
    
4. Start server: ```node server/```

5. You can find Postgresql schema and mock inserts inside ```server/schema```

## Note
A lot of this is me learning Angular and trying out new things, so many things I do may not be optimal.
