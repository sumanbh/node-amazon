# Node - Amazon
[![Build Status](https://travis-ci.org/sumanbh/node-amazon.svg?branch=master)](https://travis-ci.org/sumanbh/node-amazon)

Amazon lookalike with Node, and Angular v7 with server-side rendering. Demo at: https://sumanb.com

## Requirements
You need to have **Node v7.6.0** or higher and **PostgreSQL** installed.

## Setup
1. Install dependencies
    ```
    yarn install or npm install
    ```
    
2. Config is in: ``config/amazon.json``. Make changes there as you see fit (database host, user + password, port, OAUTH etc)
    
3. Run the migration script: ``yarn migrate``. This creates the database (default is node_amazon_dev), and initializes the tables with the seed data.

4. We can now run the development server: ```yarn start```
