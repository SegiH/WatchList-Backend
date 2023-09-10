NOTE: This repo is no longer being updated. I have included this code into the main WatchList Repo. Do not check out this code!

# WatchList-Backend
This is the backend for WatchList application. It includes a [Swagger](https://swagger.io/) backend that can be used to test each endpoint. It supports multiple users using the application.

Requirements: Docker or Node to host the backend, SQL Server for the backend database.

Database Setup:

1. Create a database named WatchList in SQL Server.
1. Edit SQL\Setup.sql and set the master key encryption password (write down this password in case you forget it!!)
1. Run the SQL script SQL\Setup.sql on the database WatchList as a user with db_creator permission. All of the commands should complete without any errors.
1. Create user account: Edit SQL\CreateUser.sql and set the username, realname, password and backend url that this service will be available at (https://watchlist-backend.yoursite.com)
1. Change password: Use the SQL script SQL\SetPassword.sql to change the password for a user account

Docker Installation:

1. Build the backend image: `docker build docker/ -t watchlistbackend:latest`
1. Edit `watchlistbackend-compose.yml`
   - Replace NETWORKNAME with your own Docker network name
   - Replace YOUR_SECRET with a password of your choice.
   - (Optional) Follow these steps if you want to be able to search IMDB directly in the app. Otherwise, do not set the environment var RAPIDAPIKEY
   
     a. Visit [RapidAPI](rapidapi.com) and create a free account.
     b. Click on "My APIs" at the top right
     c. Click on "Add New API" at the top right
     d. Name your API, give it a description and select a category. For "Specify Using" make sure UI is selected
     e. Click on "Add API" button to save it
     f. On the next page, enter a short description and click on Save
     g. Click on the down arrow next to your application name and select Security underneath the sub menu
     h. Click on the eye icon to show your API key and copy it to the clipboard.
     i. Add a variable in the compose file RAPIDAPIKEY=APIKEY
     j. Important note: RapidAPI allows you 100 free searches per month. In order for this API to work, you have to "subscribe" by adding your credit card with RapidAPI. It appears to work similarly to Amazon where they won't charge you if you do not go over your allotted API usage. If you do not add a credit card, the API will return an "Unsubscribed" error when you try to use it.
   - Replace the DB related environment variables with your own DB settings in docker/watchlistbackend.js. The backend must be a SQL Server database.
1. If you use a reverse proxy:
   - Make sure to allow GET, OPTIONS and PUT
   - Allow CORS header for the following URLS: http://localhost, http://localhost:8100 and the public URL that this WatchList backend service will be accessible at.
   - Allow credentials in the header
   - Allow WL_Username and WL_Password in the header
1. Build the backend container `docker-compose -f watchlistbackend-compose.yml up -d`
1. Run `node watchlistbackend.js`
1. Visit http://localhost:8080/swagger to view the documentation for each endpoint

Non-Docker Installation:

1. Set the following environment variables on the Node server to configure the DB connection: WatchList_User, WatchList_Password, WatchList_Host and WatchList_DB
1. Set the environment variable SECRET with a password of your choice.
1. See note above if you want to enable IMDB search in the app
1. See step above if you are behind a reverse proxy
1. Run `node watchlistbackend.js`
1. Visit http://localhost:8080/swagger to view the documentation for each endpoint
