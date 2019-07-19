IF OBJECT_ID(N'apiLogin', N'P') IS NOT NULL DROP PROCEDURE [apiLogin]
IF OBJECT_ID(N'user', N'U') IS NOT NULL DROP TABLE [user]
GO
CREATE TABLE [user] (
	[id] NVARCHAR(255) NOT NULL,
	[name] NVARCHAR(255) NOT NULL,
	[ping] DATETIMEOFFSET NOT NULL,
	CONSTRAINT [pk_user] PRIMARY KEY CLUSTERED ([id])
)
GO
CREATE PROCEDURE [apiLogin](@id NVARCHAR(255), @name NVARCHAR(255))
AS
BEGIN
	SET NOCOUNT ON
	MERGE INTO [user] t
	USING (SELECT [id] = @id, [name] = @name, [ping] = GETUTCDATE()) s ON t.[id] = s.[id]
	WHEN MATCHED THEN UPDATE SET [name] = s.[name], [ping] = s.[ping]
	WHEN NOT MATCHED BY TARGET THEN INSERT ([id], [name], [ping]) VALUES (s.[id], s.[name], s.[ping]);
	RETURN
END
GO
SELECT * FROM [user]