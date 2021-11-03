USE [WatchList]
GO

/****** Object:  Table [dbo].[WatchListSources]    Script Date: 11/3/2021 10:14:16 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WatchListSources](
	[WatchListSourceID] [int] IDENTITY(1,1) NOT NULL,
	[WatchListSourceName] [varchar](80) NOT NULL,
 CONSTRAINT [PK_WatchListSources] PRIMARY KEY CLUSTERED 
(
	[WatchListSourceID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
