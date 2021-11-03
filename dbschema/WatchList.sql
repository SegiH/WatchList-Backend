USE [WatchList]
GO

/****** Object:  Table [dbo].[WatchList]    Script Date: 11/3/2021 10:16:23 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WatchList](
	[WatchListID] [int] IDENTITY(1,1) NOT NULL,
	[WatchListItemID] [int] NOT NULL,
	[StartDate] [date] NOT NULL,
	[EndDate] [date] NULL,
	[WatchListSourceID] [int] NULL,
	[Season] [int] NULL,
	[Notes] [varchar](200) NULL,
 CONSTRAINT [PK_WatchList] PRIMARY KEY CLUSTERED 
(
	[WatchListID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


