# WatchList-Backend
Backend for WatchList application

Requirements: SQL Server for the backend database.

Database Setup:

1. Create a database named WatchList in SQL Server.
1. Run each of the SQL files in dbschema to create the necessary database tables.
1. Create a user account and grant them access to this DB.

Docker Installation:

1. Build the backend image: `docker build docker/ -t watchlistbackend:latest`
1. Edit `watchlistbackend-compose.yml`
   - Replace NETWORKNAME with your own Docker network name
   - Replace YOUR_AUTH_KEY with a secure password. You will need to enter this in the front end app
   - Replace the DB related environment variables with your own DB settings. The backend must be a SQL Server database.
1. Build the backend container `docker-compose -f watchlistbackend-compose.yml up -d`

Non-Docker Installation:

1. Set the following environment variables on the Node server to configure the DB connection: WatchList_User, WatchList_Password, WatchList_Host and WatchList_DB
1. Set the environment variable AUTH_KEY to a password of your choice. You will need to enter this in the front end app
1. Run `node watchlistbackend.js`
