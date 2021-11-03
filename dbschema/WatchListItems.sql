USE [WatchList]
GO

/****** Object:  Table [dbo].[WatchListItems]    Script Date: 11/3/2021 10:15:15 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WatchListItems](
	[WatchListItemID] [int] IDENTITY(1,1) NOT NULL,
	[WatchListItemName] [varchar](500) NOT NULL,
	[WatchListTypeID] [int] NOT NULL,
	[IMDB_URL] [varchar](200) NULL,
	[ItemNotes] [varchar](200) NULL,
 CONSTRAINT [PK_WatchListItems] PRIMARY KEY CLUSTERED 
(
	[WatchListItemID] ASC,
	[WatchListItemName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


