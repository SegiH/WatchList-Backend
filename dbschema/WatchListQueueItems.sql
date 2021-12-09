USE [WatchList]
GO

/****** Object:  Table [dbo].[WatchListQueueItems]    Script Date: 12/9/2021 2:59:17 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WatchListQueueItems](
	[WatchListQueueItemID] [int] IDENTITY(1,1) NOT NULL,
	[WatchListItemID] [int] NOT NULL,
	[Notes] [varchar](200) NOT NULL,
 CONSTRAINT [PK_WatchListQueue] PRIMARY KEY CLUSTERED 
(
	[WatchListQueueItemID] ASC,
	[WatchListItemID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


QueueItems.sqla 
