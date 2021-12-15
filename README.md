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
   - (Optional) Follow these steps if you want tobe able to search IMDB directly in the app. Otherwise, do not set the environment var RAPIDAPIKEY
   
     a. Visit [RapidAPI](rapidapi.com) and create a free account.
     b. Click on "My APIs" at the top right
     c. Click on "Add New API" at the top right
     d. Name your API, give it a description and select a category. For "Specify Using" make sure UI is selected
     e. Click on "Add API" button to save it
     f. On the next page, enter a short description and click on Save
     g. Click on your avatar icon at the top right and select "My Saved APIS"
     h. In the "Search for APIs" search field at the top, enter "Movie Database (IMDB Alternative)" without the quotation marks
     i. At the right hand side, you should see a code snippet with a headers section with a subkey called `'x-rapidapi-key'`. Copy this API key without the single quotes around it.
     j. Add a variable in the compose file RAPIDAPIKEY=APIKEY
     k. Important note: RapidAPI allows you 100 free searches per month. In order for the API to work, you have to "subscribe" by adding your credit card with RapidAPI. It appears to work similarly to Amazon why they won't charge you if you do not go over your allotted API usage. If you do not add a credit card, the API will return an "Unsubscribed" error when you try to use it.
   - Replace the DB related environment variables with your own DB settings. The backend must be a SQL Server database.
1. Build the backend container `docker-compose -f watchlistbackend-compose.yml up -d`

Non-Docker Installation:

1. Set the following environment variables on the Node server to configure the DB connection: WatchList_User, WatchList_Password, WatchList_Host and WatchList_DB
1. Set the environment variable AUTH_KEY to a password of your choice. You will need to enter this in the front end app
1. See note above if you want to enable IMDB search in the app
1. Run `node watchlistbackend.js`
