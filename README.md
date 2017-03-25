# Angular - Amazon
[![Build Status](https://travis-ci.org/sumanbh/amazon-angular.svg?branch=master)](https://travis-ci.org/sumanbh/amazon-angular)

Amazon lookalike with Angular v4, node, and Postgresql. Demo at: http://cyrano.website

## Setup
1. Clone and install dependencies
    ```
    git clone https://github.com/sumanbh/amazon-angular.git
    cd amazon-angular
    yarn install or npm install
    node_modules/@angular/cli/bin/ng build --prod --aot
    ```
    
2. Create the config file: ``nano config/amazon.json``
3. Add the following:
    ```
    {
      "sessionSecret": "YOUR_SESSION_SECRET",
      "postgresPath": "POSTGRES_URL",
      "googClientId": "GOOGLE_CLIENT",
      "googSecret": "GOOGLE_CLIENT_SECRET",
      "googCallback": "GOOGLE_AUTH_CALLBACK",
      "fbClientId": "FACEBOOK_CLIENT",
      "fbSecret": "FACEBOOK_CLIENT_SECRET",
      "fbCallback": "FACEBOOK_CLIENT_CALLBACK"
    }
    ```
    
4. Start server: ```node server/```

5. You can find Postgresql schema and mock inserts inside ```server/db/schema```

## Note
A lot of this was written when I was learning Angular (which I hope to slowly rewrite), so many things I do may not be optimal.
