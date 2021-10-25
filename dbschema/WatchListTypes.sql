USE [WatchList]
GO

/****** Object:  Table [dbo].[WatchListTypes]    Script Date: 10/23/2021 6:08:50 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[WatchListTypes](
	[WatchListTypeID] [int] IDENTITY(1,1) NOT NULL,
	[WatchListTypeName] [varchar](80) NULL,
 CONSTRAINT [PK_WatchListTypes] PRIMARY KEY CLUSTERED 
(
	[WatchListTypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
