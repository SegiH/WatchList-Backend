'use strict';

const backend="SQLServer";
const util = require('util');
const express = require('express');
const sql = require('mssql');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const app = express();

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const DEBUG = true;
const PROTOCOL = "https";

const config = {
     user: process.env.WatchList_User,
     password: process.env.WatchList_Password,
     server: process.env.WatchList_Host,
     database: process.env.WatchList_DB,
     trustServerCertificate: true
};

//Default route doesn't need to return anything 
app.get('/', (req, res) => {
     res.send("");
});

app.get('/AddWatchList', (req, res) => {
     const watchListItemID=req.query.WatchListItemID;
     const startDate=req.query.StartDate;
     const endDate=(req.query.EndDate != '' ? req.query.EndDate : null); // Optional
     const notes=req.query.Notes;
    
     if (watchListItemID === null)
          res.send(["Item ID was not provided"]);
     else if (startDate === null)
          res.send(["Start Date was not provided"]);
     else {
          let params = [['WatchListItemID',sql.Int,watchListItemID],['StartDate',sql.VarChar,startDate],['Notes',sql.VarChar,notes]];

          if (endDate != null)
               params.push(['EndDate',sql.VarChar,endDate]);

          const SQL=`INSERT INTO Watchlist(WatchListItemID,StartDate` + (endDate != null ? `,EndDate` : ``) + `,Notes) VALUES(@WatchListItemID,@StartDate` + (endDate != null ?  `,@EndDate` : ``) + `,@Notes);`;

          execSQL(res,SQL,params,false);
     }
});

app.get('/AddWatchListItem', (req, res) => {
     const name=req.query.Name;
     const type=req.query.Type;
     const imdb_url=req.query.IMDB_URL;
    
     if (name === null)
          res.send(["Name was not provided"]);
     else if (type === null)
          res.send(["Type was not provided"]);
     else {
          const params = [['WatchListItemName',sql.VarChar,name],['WatchListTypeID',sql.VarChar,type],['IMDB_URL',sql.VarChar,imdb_url]];

          const SQL=`INSERT INTO WatchlistItems(WatchListItemName,WatchListTypeID,IMDB_URL) VALUES(@WatchListItemName,@WatchListTypeID,@IMDB_URL);`;
  
          execSQL(res,SQL,params,false);
     }
});

app.get('/GetWatchList', (req, res) => {
     const searchTerm=req.query.SearchTerm;
     let sortColumn=req.query.SortColumn;
     let sortDirection=req.query.SortDirection;

     if (sortColumn === null || typeof sortColumn == 'undefined')
          sortColumn="WatchListItemName";
     else if (sortColumn === "ID")
          sortColumn="WatchListID";
     else if (sortColumn === "Name") 
          sortColumn="WatchListItemName";
     else if (sortColumn === "StartDate" || sortColumn === "EndDate") {} // Nothing to do for these columns

     if (sortDirection === null || typeof sortDirection == 'undefined' ||(sortDirection !== "ASC" && sortDirection != "DESC")) 
          sortDirection="ASC";
    
     let params = [['SortColumn',null,sortColumn],['SortDirection',null,sortDirection]];

     if (searchTerm != null)
          params.push(['SearchTerm',sql.VarChar,searchTerm]);

     const SQL=`SELECT WatchListID,WatchList.WatchListItemID,CONVERT(VARCHAR(20),StartDate,101) AS StartDate,CONVERT(VARCHAR(20),EndDate,101) AS EndDate,Notes FROM WatchList LEFT JOIN WatchListItems ON WatchListItems.WatchListItemID=WatchList.WatchListItemID` + (searchTerm != null ? ` WHERE WatchListItemName LIKE @SearchTerm OR Notes LIKE @SearchTerm` : ``) + ` ORDER BY @SortColumn @SortDirection`;
     
     execSQL(res,SQL,params,true);
});

app.get('/GetWatchListItems', (req, res) => {
     const searchTerm=req.query.SearchTerm;
     let sortColumn=req.query.SortColumn;
     let sortDirection=req.query.SortDirection;

     if (sortColumn === null || typeof sortColumn == 'undefined')
          sortColumn="WatchListItemName";
     else if (sortColumn === "ID")
          sortColumn="WatchListItemID";
     else if (sortColumn === "Name")
          sortColumn="WatchListItemName";
     else if (sortColumn === "Type")
          sortColumn="WatchListTypeID";
     else if (sortColumn === "IMDB_URL") {} // Nothing to do for this columns

     if (sortDirection === null || typeof sortDirection == 'undefined' ||(sortDirection !== "ASC" && sortDirection != "DESC"))
          sortDirection="ASC";
     
     let params = [['SortColumn',null,sortColumn],['SortDirection',null,sortDirection]];

     if (searchTerm != null)
          params.push(['SearchTerm',sql.VarChar,searchTerm]);
     
     const SQL=`SELECT * FROM WatchlistItems` + (searchTerm != null ? ` WHERE WatchListItemName LIKE '%' + @SearchTerm + '%' OR IMDB_URL LIKE '%' + @SearchTerm + '%'` : ``) + ` ORDER BY @SortColumn @SortDirection`;
     
     execSQL(res,SQL,params,true);
});

app.get('/GetWatchListTypes', (req, res) => {
     const SQL="SELECT * FROM WatchListTypes ORDER BY WatchlistTypeID";
  
     execSQL(res,SQL,null,true);
});

app.get('/UpdateWatchList', (req, res) => {
     const watchListID=req.query.WatchListItemID;
     const watchListItemID=req.query.WatchListItemID;
     const startDate=req.query.StartDate;
     const endDate=(req.query.EndDate != '' ? req.query.EndDate : null);
     const notes=req.query.Notes;
    
     if (id === null)
          res.send(["ID was not provided"]);
     if (itemId === null)
          res.send(["Item ID was not provided"]);
     else if (startDate === null)
          res.send(["Start Date was not provided"]);
     else {
          let params = [['WatchListID',sql.Int,watchListID],['WatchListItemID',sql.Int,watchListItemID],['StartDate',sql.VarChar,startDate],['Notes',sql.VarChar,notes]];

          if (endDate != null)
               params.push(['EndDate',sql.VarChar,endDate]);

          const SQL=`UPDATE WatchList SET WatchListItemID=@WatchListItemID',StartDate=@StartDate,EndDate=` + (endDate != null ? '@EndDate' : null) + `,Notes=@Notes WHERE WatchListID=@WatchListID`;
  
          execSQL(res,SQL,params,false);
     }
});

app.get('/UpdateWatchListItem', (req, res) => {
     const watchListItemID=req.query.WatchListItemID;
     const name=req.query.WatchListItemName;
     const typeId=req.query.WatchListTypeID;
     const imdb_url=req.query.IMDB_URL;
    
     if (id === null)
          res.send(["ID was not provided"]);
     else if (name === null)
          res.send(["Name was not provided"]);
     else if (typeId === null)
          res.send(["Type was not provided"]);
     else {
          const params = [['WatchListItemID',sql.Int,watchListItemID],['WatchListItemName',sql.VarChar,name],['WatchListTypeID',sql.VarChar,type],['IMDB_URL',sql.VarChar,imdb_url]];

          if (endDate != null)
               params.push(['EndDate',sql.VarChar,endDate]);

          const SQL=`UPDATE WatchlistItems SET WatchListItemName=@WatchListItemName,WatchListTypeID=@WatchListTypeID,IMDB_URL=@IMDB_URL WHERE WatchlistItemID=@WatchListItemID;`;
  
          execSQL(res,SQL,params,false);
     }
});

function execSQL(res,SQL,params,isQuery) {
     try {
          // connect to your database
          var connection = new Connection(config);

          sql.connect(config,function (err) {
               if (err) {
                    console.log(err);
                    res.send(`An error occurred connecting to the database with the error ${err}`);
               } else {
                    const request = new sql.Request();
                    
                    if (params != null) { // parameterize SQL query parameters 
                         for (let i=0;i<params.length;i++) {
                              if (params[i][0] !== "SortColumn" && params[i][0] != "SortDirection") { // These columns are part of the ORDER BY and cannot be parameterized. It won't work if you try!!
                                   request.input(params[i][0],params[i][1],params[i][2]);
                              } else if ((params[i][0] === "SortColumn" && params[i][2] != null))  {
                                   const approvedSortColumnNames=['WatchListID','WatchListItemID','WatchListItemName','StartDate','EndDate','WatchListTypeID','IMDB_URL'];
 
                                   if (params[i][0] == "SortColumn" && approvedSortColumnNames.includes(params[i][2]))
                                        SQL=SQL.replace("@SortColumn",params[i][2]);
                              } else if ((params[i][0] === "SortDirection" && params[i][2] != null))  {
                                   const approvedSortColumnDirections=['ASC','DESC'];
                              
                                   if (params[i][0] == "SortDirection" && approvedSortColumnDirections.includes(params[i][2])) {
                                        SQL=SQL.replace("@SortDirection",params[i][2]);
                                   }
                              }
                         }
                    }
                  
                    // console.log(`SQL=${SQL} and params=${params}`);

                    request.query(SQL,function (err,data) {
                         if (err) res.send(err)

                         // if SQL is a query send records as a response
                         if (isQuery)
                              try {
                                   res.send(data.recordset);
                              } catch(error) {
                                   console.log(`The error ${error} occurred with the SQL query ${SQL} and the params ${params}`);
                              } 
                         else
                              res.send('');
                    });
               }
          });
     } catch(e) {
          console.log("Error!");
          res.send("Error is " + e);
     }
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
