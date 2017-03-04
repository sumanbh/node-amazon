# Angular 2 Amazon
Amazon lookalike with Angular v2, node, and Postgresql. Demo at: http://cyrano.website

## Setup

```
git clone https://github.com/sumanbh/amazon-angular.git
cd amazon-angular
yarn install or npm install
node_modules/@angular/cli/bin/ng build --prod --aot
node server/server.js
```
You can find Postgresql schema and inserts inside ```server/db/schema```. Config file goes inside ```config/amazon.json```.
## Note
A lot of the code was written when I was learning Angular and JS in general, so many things I do *is* not optimal and needs to be re-written.
