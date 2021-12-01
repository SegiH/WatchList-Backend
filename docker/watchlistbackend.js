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

const config = {
     user: process.env.WatchList_User,
     password: process.env.WatchList_Password,
     server: process.env.WatchList_Host,
     database: process.env.WatchList_DB,
     trustServerCertificate: true
};

// Date prototype to return date in format yyyymmdd. Used to convert date field for database queries
Date.prototype.yyyymmdd = function() {
     var yyyy = this.getFullYear().toString();
     var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
     var dd  = this.getDate().toString();
     
     return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
};

//Default route doesn't need to return anything 
app.get('/', (req, res) => {
     res.send("");
});

app.get('/AddWatchList', (req, res) => {
     const watchListItemID=req.query.WatchListItemID;
     const startDate=req.query.StartDate;
     const endDate=(req.query.EndDate != '' ? req.query.EndDate : null); // Optional
     const sourceID=req.query.WatchListSourceID;
     const season=req.query.Season;
     const notes=req.query.Notes;
    
     if (watchListItemID === null)
          res.send(["Item ID was not provided"]);
     else if (startDate === null)
          res.send(["Start Date was not provided"]);
     else {
          let params = [['WatchListItemID',sql.Int,watchListItemID],['StartDate',sql.VarChar,startDate]];

          let columns=`WatchListItemID,StartDate`;
          let values = `@WatchListItemID,@StartDate`;

          columns+=`,EndDate`;

          if (endDate != null) {
               params.push(['EndDate',sql.VarChar,endDate]);
               values+=`,@EndDate`;
          } else {
               values+=`,NULL`;
          }

          columns+=`,WatchListSourceID`;

          if (sourceID != null) {
               params.push(['WatchListSourceID',sql.Int,sourceID]);
               values+=`,@WatchListSourceID`;
          } else {
               values+=`,NULL`;
          } 

          columns+=`,Season`;

          if (season != null) {
               params.push(['Season',sql.Int,season]);
               values+=`,@Season`;
          } else {
               values+=`,NULL`;
          } 

          columns+=`,Notes`;

          if (notes != null && notes != 'null') {
               params.push(['Notes',sql.VarChar,notes]);
               values+=`,@Notes`;
          } else {
               values+=`,NULL`;
          } 
  
          const SQL=`INSERT INTO Watchlist(${columns}) VALUES (${values});`;

          execSQL(res,SQL,params,false);
     }
});

app.get('/AddWatchListItem', (req, res) => {
     const name=req.query.Name;
     const type=req.query.Type;
     const imdb_url=req.query.IMDB_URL;
     const notes=req.query.ItemNotes;
    
     if (name === null)
          res.send(["Name was not provided"]);
     else if (type === null)
          res.send(["Type was not provided"]);
     else {
          const params = [['WatchListItemName',sql.VarChar,name],['WatchListTypeID',sql.VarChar,type]];

          let columns=`WatchListItemName,WatchListTypeID`;
          let values = `@WatchListItemName,@WatchListTypeID`;

          columns+=`,IMDB_URL`;

          if (imdb_url != null) {
               params.push(['IMDB_URL',sql.VarChar,imdb_url]);
               values+=`,@IMDB_URL`;
          } else {
               values+=`,NULL`;
          } 

          columns+=`,ItemNotes`;

          if (notes != null && notes != 'null' && typeof notes != 'undefined') {
               params.push(['ItemNotes',sql.VarChar,notes]);
               values+=`,@ItemNotes`;
          } else {
               values+=`,NULL`;
          } 
          
          const SQL=`IF (SELECT COUNT(*) FROM WatchListItems WHERE WatchListItemName=@WatchListItemName) = 0 INSERT INTO WatchlistItems(${columns}) VALUES (${values});`;
 
          execSQL(res,SQL,params,false);
     }
});

app.get('/DeleteWatchList', (req, res) => {
     const watchListID=req.query.WatchListID;
     
     let params = [];

     if (watchListID === null)
          res.send(["ID was not provided"]);
     else {
          params.push(['WatchListID',sql.Int,watchListID]);

          const SQL=`DELETE TOP(1) FROM Watchlist WHERE WatchListID=@WatchListID`;

          execSQL(res,SQL,params,false);
     }
});

app.get('/DeleteWatchListItem', (req, res) => {
     const watchListItemID=req.query.WatchListItemID;
     
     let params = [];

     if (watchListItemID === null)
          res.send(["Item ID was not provided"]);
     else {
          params.push(['WatchListItemID',sql.Int,watchListItemID]);

          const SQL=`DELETE TOP(1) FROM WatchlistItems WHERE WatchListItemID=@WatchListItemID`;

          execSQL(res,SQL,params,false);
     }
});

app.get('/GetWatchList', (req, res) => {
     const searchTerm=req.query.SearchTerm;
     let sortColumn=req.query.SortColumn;
     let sortDirection=req.query.SortDirection;
     let recordLimit=req.query.RecordLimit;
     let sourceFilter=req.query.SourceFilter;
     let incompleteFilter=(req.query.IncompleteFilter == "true" ? true : false);

     if (recordLimit == null)
          recordLimit=10;

     if (sortColumn === null || typeof sortColumn == 'undefined')
          sortColumn="WatchListItemName";
     else if (sortColumn === "ID")
          sortColumn="WatchListID";
     else if (sortColumn === "Name") 
          sortColumn="WatchListItemName";
     else if (sortColumn === "StartDate" || sortColumn === "EndDate") {} // Nothing to do for these columns

     if (sortDirection === null || typeof sortDirection == 'undefined' ||(sortDirection !== "ASC" && sortDirection != "DESC")) 
          sortDirection="ASC";
    
     let params  = [];

     if (searchTerm != null)
          params.push(['SearchTerm',sql.VarChar,searchTerm]);

     let whereClause = ``;
     
     if (searchTerm != null)
          whereClause=` WHERE (WatchListItemName LIKE '%' + @SearchTerm + '%' OR Notes LIKE '%' + @SearchTerm + '%')`;

     if (sourceFilter != null) {
          if (whereClause == ``)
               whereClause+=` WHERE `;
          else
               whereClause+=` AND `;

          whereClause+=`WatchList.WatchListSourceID=${sourceFilter}`;
     }

     if (incompleteFilter == true) {
          if (whereClause == ``)
               whereClause+=` WHERE `;
          else
               whereClause+=` AND `;
   
          whereClause+=`WatchList.EndDate IS NULL`;
     }
       
     const orderBy=` ORDER BY ${(sortColumn == "WatchListItemName" ? `WatchListItems` : `WatchList`)}.${sortColumn} ${sortDirection}`;

     const SQL=`SELECT ` + (recordLimit != null ? `TOP(${recordLimit})` : ``) + ` WatchListID,WatchList.WatchListItemID,CONVERT(VARCHAR(10),StartDate,126) AS StartDate,CONVERT(VARCHAR(10),EndDate,126) AS EndDate,WatchList.WatchListSourceID,Season,Notes FROM WatchList LEFT JOIN WatchListItems ON WatchListItems.WatchListItemID=WatchList.WatchListItemID LEFT JOIN WatchListSources ON WatchListSources.WatchListSourceID=WatchList.WatchListSourceID` + whereClause + orderBy;
 
     execSQL(res,SQL,params,true);
});

app.get('/GetWatchListItems', (req, res) => {
     let recordLimit=req.query.RecordLimit;
     const searchTerm=req.query.SearchTerm;
     let sortColumn=req.query.SortColumn;
     let sortDirection=req.query.SortDirection;
     const IMDBURLMissing=(req.query.IMDBURLMissing == "true" ? true : false);

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
     
     const SQL=`SELECT ` + (recordLimit != null ? `TOP(${recordLimit})` : ``) + ` * FROM WatchListItems` + (searchTerm != null ? ` WHERE WatchListItemName LIKE '%' + @SearchTerm + '%' OR IMDB_URL LIKE '%' + @SearchTerm + '%'` : ``) + (IMDBURLMissing == true ? (searchTerm == null ? ` WHERE ` : ` AND `) + `(IMDB_URL IS NULL OR IMDB_URL='')` : ``) + ` ORDER BY @SortColumn @SortDirection`;
 
     execSQL(res,SQL,params,true);
});

app.get('/GetWatchListSources', (req, res) => {
     const SQL="SELECT * FROM WatchListSources ORDER BY WatchlistSourceName";
  
     execSQL(res,SQL,null,true);
});

app.get('/GetWatchListTypes', (req, res) => {
     const SQL="SELECT * FROM WatchListTypes ORDER BY WatchlistTypeName";
  
     execSQL(res,SQL,null,true);
});

app.get('/GetWatchListMovieStats', (req, res) => {
     const SQL="WITH GetFrequentItems AS (SELECT WatchListItemName,COUNT(*) AS ItemCount FROM WatchList WL LEFT JOIN WatchListItems WLI ON WLI.WatchListItemID=WL.WatchListItemID WHERE WLI.WatchListTypeID=1 GROUP BY WatchListItemName) SELECT TOP(10) *,(SELECT IMDB_URL FROM WatchListItems WHERE WatchListItemName=GetFrequentItems.WatchListItemName) AS IMDB_URL FROM GetFrequentItems WHERE ItemCount > 1 ORDER BY WatchListItemName DESC";
  
     execSQL(res,SQL,null,true);
});

app.get('/GetWatchListTVStats', (req, res) => {
     const SQL="WITH GetFrequentItems AS (SELECT WLI.WatchListItemName,MIN(StartDate) AS StartDate,MAX(StartDate) AS EndDate,COUNT(*) AS ItemCount FROM WatchList WL LEFT JOIN WatchListItems WLI ON WLI.WatchListItemID=WL.WatchListItemID LEFT JOIN WatchListTypes WLT ON WLT.WatchListTypeID=WLI.WatchListTypeID WHERE WLI.WatchListTypeID=2 AND WL.EndDate IS NOT NULL GROUP BY WatchListItemName) SELECT TOP(10) *,(SELECT IMDB_URL FROM WatchListItems WHERE WatchListItemName=GetFrequentItems.WatchListItemName) AS IMDB_URL FROM GetFrequentItems WHERE ItemCount > 1 ORDER BY WatchListItemName DESC";
  
     execSQL(res,SQL,null,true);
});

app.get('/UpdateWatchList', (req, res) => {
     const watchListID=req.query.WatchListID;
     const watchListItemID=req.query.WatchListItemID;
     const startDate=req.query.StartDate;
     const endDate=(req.query.EndDate != null && req.query.endDate != 'null' ? req.query.EndDate : null);
     const notes=req.query.Notes;
     const sourceID=req.query.WatchListSourceID;
     const season=req.query.Season;
 
     if (watchListID === null)
          res.send(["ID was not provided"]);
     if (watchListItemID === null)
          res.send(["Item ID was not provided"]);
     else if (startDate === null)
          res.send(["Start Date was not provided"]);
     else {
          let params = [['WatchListID',sql.Int,watchListID],['WatchListItemID',sql.Int,watchListItemID],['StartDate',sql.VarChar,new Date(startDate).yyyymmdd()]];

          if (endDate != null)
               params.push(['EndDate',sql.VarChar,new Date(endDate).yyyymmdd()]);

          if (sourceID != null)
               params.push(['WatchListSourceID',sql.Int,sourceID]);
 
          if (sourceID != null)
               params.push(['Source',sql.VarChar,sourceID]); // Theres a bug in Node that throws an incorrect error "Validation failed for parameter 'WatchListSourceID'. Invalid number." if using Int type

          if (season != null)
               params.push(['Season',sql.VarChar,season]); // Theres a bug in Node that throws an incorrect error "Validation failed for parameter 'WatchListSourceID'. Invalid number." if using Int type

          if (notes != null)
               params.push(['Notes',sql.VarChar,notes]);

          const SQL=`UPDATE WatchList SET WatchListItemID=@WatchListItemID,StartDate=@StartDate` + (endDate != null ? ',EndDate=@EndDate' : `,EndDate=null`) + (sourceID != null ? `,WatchListSourceID=@WatchListSourceID` : `,WatchListSourceID=NULL`) + (season != null ? `,Season=@Season` : `,Season=NULL`) + (notes != null ? `,Notes=@Notes` : `,Notes=NULL`) + ` WHERE WatchListID=@WatchListID`;
          //res.send(`SQL=*${SQL}* watchListID=*${watchListID}* watchListItemID=*${watchListItemID}* startDate=*${startDate}* endDate=*${endDate}* notes=*${notes}*,season=*${season}`);
          execSQL(res,SQL,params,false);
     }
});

app.get('/UpdateWatchListItem', (req, res) => {
     const watchListItemID=req.query.WatchListItemID;
     const name=req.query.WatchListItemName;
     const typeId=req.query.WatchListTypeID;
     const imdb_url=req.query.IMDB_URL;
     const notes=req.query.ItemNotes;
    
     if (watchListItemID === null)
          res.send(["ID was not provided"]);
     else if (name === null)
          res.send(["Name was not provided"]);
     else if (typeId === null)
          res.send(["Type was not provided"]);
     else {
          const params = [['WatchListItemID',sql.Int,watchListItemID],['WatchListItemName',sql.VarChar,name],['WatchListTypeID',sql.VarChar,typeId]]; // Mandatory columns

          if (imdb_url != null)
               params.push(['IMDB_URL',sql.VarChar,imdb_url]);
          
          if (notes != null && notes != 'null')
               params.push(['ItemNotes',sql.VarChar,notes]);

          const SQL=`UPDATE WatchlistItems SET WatchListItemName=@WatchListItemName,WatchListTypeID=@WatchListTypeID` + (imdb_url != null ? `,IMDB_URL=@IMDB_URL` : `,IMDB_URL=NULL`) + (notes != null ? `,ItemNotes=@ItemNotes` : `,ItemNotes=NULL`) + ` WHERE WatchlistItemID=@WatchListItemID;`;
  
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

