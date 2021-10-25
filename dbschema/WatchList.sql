USE [WatchList]
GO

/****** Object:  Table [dbo].[WatchList]    Script Date: 10/23/2021 6:06:14 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WatchList](
	[WatchListID] [int] IDENTITY(1,1) NOT NULL,
	[WatchListItemID] [int] NOT NULL,
	[StartDate] [date] NOT NULL,
	[EndDate] [date] NULL,
	[Notes] [varchar](200) NULL,
 CONSTRAINT [PK_WatchList] PRIMARY KEY CLUSTERED 
(
	[WatchListID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


