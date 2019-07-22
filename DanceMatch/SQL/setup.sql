IF OBJECT_ID(N'apiQuality', N'P') IS NOT NULL DROP PROCEDURE [apiQuality]
IF OBJECT_ID(N'apiCountry', N'P') IS NOT NULL DROP PROCEDURE [apiCountry]
IF OBJECT_ID(N'apiAge', N'P') IS NOT NULL DROP PROCEDURE [apiAge]
IF OBJECT_ID(N'apiProfile', N'P') IS NOT NULL DROP PROCEDURE [apiProfile]
IF OBJECT_ID(N'apiLogin', N'P') IS NOT NULL DROP PROCEDURE [apiLogin]
IF OBJECT_ID(N'importance', N'U') IS NOT NULL DROP TABLE [importance]
IF OBJECT_ID(N'quality', N'U') IS NOT NULL DROP TABLE [quality]
IF OBJECT_ID(N'rating', N'U') IS NOT NULL DROP TABLE [rating]
IF OBJECT_ID(N'demographic', N'U') IS NOT NULL DROP TABLE [demographic]
IF OBJECT_ID(N'country', N'U') IS NOT NULL DROP TABLE [country]
IF OBJECT_ID(N'age', N'U') IS NOT NULL DROP TABLE [age]
IF OBJECT_ID(N'role', N'U') IS NOT NULL DROP TABLE [role]
IF OBJECT_ID(N'user', N'U') IS NOT NULL DROP TABLE [user]
GO
CREATE TABLE [user] (
	[id] NVARCHAR(255) NOT NULL,
	[name] NVARCHAR(255) NOT NULL,
	[ping] DATETIMEOFFSET NOT NULL,
	CONSTRAINT [pk_user] PRIMARY KEY CLUSTERED ([id])
)
GO
CREATE TABLE [role] (
	[id] BIT NOT NULL,
	[description] NVARCHAR(8) NOT NULL,
	CONSTRAINT [pk_role] PRIMARY KEY CLUSTERED ([id]),
	CONSTRAINT [uq_role_description] UNIQUE ([description])
)
GO
INSERT INTO [role] ([id], [description])
VALUES
	(0, N'Leader'),
	(1, N'Follower')
GO
CREATE TABLE [age] (
	[id] TINYINT NOT NULL,
	[description] NVARCHAR(8) NOT NULL,
	CONSTRAINT [pk_age] PRIMARY KEY CLUSTERED ([id]),
	CONSTRAINT [uq_age_description] UNIQUE ([description])
)
GO
INSERT INTO [age] ([id], [description])
VALUES
	(0, N'<18'),
	(1, N'18-24'),
	(2, N'25-30'),
	(3, N'31-40'),
	(4, N'41-50'),
	(5, N'51-64'),
	(6, N'65+')
GO
CREATE TABLE [country] (
	[id] NCHAR(2) NOT NULL,
	[name] NVARCHAR(255) NOT NULL,
	CONSTRAINT [pk_country] PRIMARY KEY ([id]),
	CONSTRAINT [uq_country_name] UNIQUE CLUSTERED ([name])
)
GO
INSERT INTO [country] ([id], [name])
VALUES
	(N'AF', 'Afghanistan'),
	(N'AX', 'Åland Islands'),
	(N'AL', 'Albania'),
	(N'DZ', 'Algeria'),
	(N'AS', 'American Samoa'),
	(N'AD', 'Andorra'),
	(N'AO', 'Angola'),
	(N'AI', 'Anguilla'),
	(N'AQ', 'Antarctica'),
	(N'AG', 'Antigua and Barbuda'),
	(N'AR', 'Argentina'),
	(N'AM', 'Armenia'),
	(N'AW', 'Aruba'),
	(N'AU', 'Australia'),
	(N'AT', 'Austria'),
	(N'AZ', 'Azerbaijan'),
	(N'BS', 'Bahamas'),
	(N'BH', 'Bahrain'),
	(N'BD', 'Bangladesh'),
	(N'BB', 'Barbados'),
	(N'BY', 'Belarus'),
	(N'BE', 'Belgium'),
	(N'BZ', 'Belize'),
	(N'BJ', 'Benin'),
	(N'BM', 'Bermuda'),
	(N'BT', 'Bhutan'),
	(N'BO', 'Bolivia, Plurinational State of'),
	(N'BQ', 'Bonaire, Sint Eustatius and Saba'),
	(N'BA', 'Bosnia and Herzegovina'),
	(N'BW', 'Botswana'),
	(N'BV', 'Bouvet Island'),
	(N'BR', 'Brazil'),
	(N'IO', 'British Indian Ocean Territory'),
	(N'BN', 'Brunei Darussalam'),
	(N'BG', 'Bulgaria'),
	(N'BF', 'Burkina Faso'),
	(N'BI', 'Burundi'),
	(N'KH', 'Cambodia'),
	(N'CM', 'Cameroon'),
	(N'CA', 'Canada'),
	(N'CV', 'Cape Verde'),
	(N'KY', 'Cayman Islands'),
	(N'CF', 'Central African Republic'),
	(N'TD', 'Chad'),
	(N'CL', 'Chile'),
	(N'CN', 'China'),
	(N'CX', 'Christmas Island'),
	(N'CC', 'Cocos (Keeling) Islands'),
	(N'CO', 'Colombia'),
	(N'KM', 'Comoros'),
	(N'CG', 'Congo'),
	(N'CD', 'Congo, the Democratic Republic of the'),
	(N'CK', 'Cook Islands'),
	(N'CR', 'Costa Rica'),
	(N'CI', 'Côte d''Ivoire'),
	(N'HR', 'Croatia'),
	(N'CU', 'Cuba'),
	(N'CW', 'Curaçao'),
	(N'CY', 'Cyprus'),
	(N'CZ', 'Czech Republic'),
	(N'DK', 'Denmark'),
	(N'DJ', 'Djibouti'),
	(N'DM', 'Dominica'),
	(N'DO', 'Dominican Republic'),
	(N'EC', 'Ecuador'),
	(N'EG', 'Egypt'),
	(N'SV', 'El Salvador'),
	(N'GQ', 'Equatorial Guinea'),
	(N'ER', 'Eritrea'),
	(N'EE', 'Estonia'),
	(N'ET', 'Ethiopia'),
	(N'FK', 'Falkland Islands (Malvinas)'),
	(N'FO', 'Faroe Islands'),
	(N'FJ', 'Fiji'),
	(N'FI', 'Finland'),
	(N'FR', 'France'),
	(N'GF', 'French Guiana'),
	(N'PF', 'French Polynesia'),
	(N'TF', 'French Southern Territories'),
	(N'GA', 'Gabon'),
	(N'GM', 'Gambia'),
	(N'GE', 'Georgia'),
	(N'DE', 'Germany'),
	(N'GH', 'Ghana'),
	(N'GI', 'Gibraltar'),
	(N'GR', 'Greece'),
	(N'GL', 'Greenland'),
	(N'GD', 'Grenada'),
	(N'GP', 'Guadeloupe'),
	(N'GU', 'Guam'),
	(N'GT', 'Guatemala'),
	(N'GG', 'Guernsey'),
	(N'GN', 'Guinea'),
	(N'GW', 'Guinea-Bissau'),
	(N'GY', 'Guyana'),
	(N'HT', 'Haiti'),
	(N'HM', 'Heard Island and McDonald Islands'),
	(N'VA', 'Holy See (Vatican City State)'),
	(N'HN', 'Honduras'),
	(N'HK', 'Hong Kong'),
	(N'HU', 'Hungary'),
	(N'IS', 'Iceland'),
	(N'IN', 'India'),
	(N'ID', 'Indonesia'),
	(N'IR', 'Iran, Islamic Republic of'),
	(N'IQ', 'Iraq'),
	(N'IE', 'Ireland'),
	(N'IM', 'Isle of Man'),
	(N'IL', 'Israel'),
	(N'IT', 'Italy'),
	(N'JM', 'Jamaica'),
	(N'JP', 'Japan'),
	(N'JE', 'Jersey'),
	(N'JO', 'Jordan'),
	(N'KZ', 'Kazakhstan'),
	(N'KE', 'Kenya'),
	(N'KI', 'Kiribati'),
	(N'KP', 'Korea, Democratic People''s Republic of'),
	(N'KR', 'Korea, Republic of'),
	(N'KW', 'Kuwait'),
	(N'KG', 'Kyrgyzstan'),
	(N'LA', 'Lao People''s Democratic Republic'),
	(N'LV', 'Latvia'),
	(N'LB', 'Lebanon'),
	(N'LS', 'Lesotho'),
	(N'LR', 'Liberia'),
	(N'LY', 'Libya'),
	(N'LI', 'Liechtenstein'),
	(N'LT', 'Lithuania'),
	(N'LU', 'Luxembourg'),
	(N'MO', 'Macao'),
	(N'MK', 'Macedonia, the Former Yugoslav Republic of'),
	(N'MG', 'Madagascar'),
	(N'MW', 'Malawi'),
	(N'MY', 'Malaysia'),
	(N'MV', 'Maldives'),
	(N'ML', 'Mali'),
	(N'MT', 'Malta'),
	(N'MH', 'Marshall Islands'),
	(N'MQ', 'Martinique'),
	(N'MR', 'Mauritania'),
	(N'MU', 'Mauritius'),
	(N'YT', 'Mayotte'),
	(N'MX', 'Mexico'),
	(N'FM', 'Micronesia, Federated States of'),
	(N'MD', 'Moldova, Republic of'),
	(N'MC', 'Monaco'),
	(N'MN', 'Mongolia'),
	(N'ME', 'Montenegro'),
	(N'MS', 'Montserrat'),
	(N'MA', 'Morocco'),
	(N'MZ', 'Mozambique'),
	(N'MM', 'Myanmar'),
	(N'NA', 'Namibia'),
	(N'NR', 'Nauru'),
	(N'NP', 'Nepal'),
	(N'NL', 'Netherlands'),
	(N'NC', 'New Caledonia'),
	(N'NZ', 'New Zealand'),
	(N'NI', 'Nicaragua'),
	(N'NE', 'Niger'),
	(N'NG', 'Nigeria'),
	(N'NU', 'Niue'),
	(N'NF', 'Norfolk Island'),
	(N'MP', 'Northern Mariana Islands'),
	(N'NO', 'Norway'),
	(N'OM', 'Oman'),
	(N'PK', 'Pakistan'),
	(N'PW', 'Palau'),
	(N'PS', 'Palestine, State of'),
	(N'PA', 'Panama'),
	(N'PG', 'Papua New Guinea'),
	(N'PY', 'Paraguay'),
	(N'PE', 'Peru'),
	(N'PH', 'Philippines'),
	(N'PN', 'Pitcairn'),
	(N'PL', 'Poland'),
	(N'PT', 'Portugal'),
	(N'PR', 'Puerto Rico'),
	(N'QA', 'Qatar'),
	(N'RE', 'Réunion'),
	(N'RO', 'Romania'),
	(N'RU', 'Russian Federation'),
	(N'RW', 'Rwanda'),
	(N'BL', 'Saint Barthélemy'),
	(N'SH', 'Saint Helena, Ascension and Tristan da Cunha'),
	(N'KN', 'Saint Kitts and Nevis'),
	(N'LC', 'Saint Lucia'),
	(N'MF', 'Saint Martin (French part)'),
	(N'PM', 'Saint Pierre and Miquelon'),
	(N'VC', 'Saint Vincent and the Grenadines'),
	(N'WS', 'Samoa'),
	(N'SM', 'San Marino'),
	(N'ST', 'Sao Tome and Principe'),
	(N'SA', 'Saudi Arabia'),
	(N'SN', 'Senegal'),
	(N'RS', 'Serbia'),
	(N'SC', 'Seychelles'),
	(N'SL', 'Sierra Leone'),
	(N'SG', 'Singapore'),
	(N'SX', 'Sint Maarten (Dutch part)'),
	(N'SK', 'Slovakia'),
	(N'SI', 'Slovenia'),
	(N'SB', 'Solomon Islands'),
	(N'SO', 'Somalia'),
	(N'ZA', 'South Africa'),
	(N'GS', 'South Georgia and the South Sandwich Islands'),
	(N'SS', 'South Sudan'),
	(N'ES', 'Spain'),
	(N'LK', 'Sri Lanka'),
	(N'SD', 'Sudan'),
	(N'SR', 'Suriname'),
	(N'SJ', 'Svalbard and Jan Mayen'),
	(N'SZ', 'Swaziland'),
	(N'SE', 'Sweden'),
	(N'CH', 'Switzerland'),
	(N'SY', 'Syrian Arab Republic'),
	(N'TW', 'Taiwan, Province of China'),
	(N'TJ', 'Tajikistan'),
	(N'TZ', 'Tanzania, United Republic of'),
	(N'TH', 'Thailand'),
	(N'TL', 'Timor-Leste'),
	(N'TG', 'Togo'),
	(N'TK', 'Tokelau'),
	(N'TO', 'Tonga'),
	(N'TT', 'Trinidad and Tobago'),
	(N'TN', 'Tunisia'),
	(N'TR', 'Turkey'),
	(N'TM', 'Turkmenistan'),
	(N'TC', 'Turks and Caicos Islands'),
	(N'TV', 'Tuvalu'),
	(N'UG', 'Uganda'),
	(N'UA', 'Ukraine'),
	(N'AE', 'United Arab Emirates'),
	(N'GB', 'United Kingdom'),
	(N'US', 'United States'),
	(N'UM', 'United States Minor Outlying Islands'),
	(N'UY', 'Uruguay'),
	(N'UZ', 'Uzbekistan'),
	(N'VU', 'Vanuatu'),
	(N'VE', 'Venezuela, Bolivarian Republic of'),
	(N'VN', 'Viet Nam'),
	(N'VG', 'Virgin Islands, British'),
	(N'VI', 'Virgin Islands, US'),
	(N'WF', 'Wallis and Futuna'),
	(N'EH', 'Western Sahara'),
	(N'YE', 'Yemen'),
	(N'ZM', 'Zambia'),
	(N'ZW', 'Zimbabwe')
GO
CREATE TABLE [demographic] (
	[userId] NVARCHAR(255) NOT NULL,
	[roleId] BIT NOT NULL,
	[ageId] TINYINT NOT NULL,
	[countryId] NCHAR(2) NOT NULL,
	CONSTRAINT [pk_demographic] PRIMARY KEY CLUSTERED ([userId]),
	CONSTRAINT [fk_demographic_user] FOREIGN KEY ([userId]) REFERENCES [user] ([id]) ON DELETE CASCADE,
	CONSTRAINT [fk_demographic_role] FOREIGN KEY ([roleId]) REFERENCES [role] ([id]),
	CONSTRAINT [fk_demographic_age] FOREIGN KEY ([ageId]) REFERENCES [age] ([id]),
	CONSTRAINT [fk_demographic_country] FOREIGN KEY ([countryId]) REFERENCES [country] ([id])
)
GO
CREATE TABLE [rating] (
	[id] INT NOT NULL,
	[importance] NVARCHAR(25) NOT NULL,
	[preference] NVARCHAR(25) NOT NULL,
	CONSTRAINT [pk_rating] PRIMARY KEY CLUSTERED ([id]),
	CONSTRAINT [uq_rating_importance] UNIQUE ([importance]),
	CONSTRAINT [uq_rating_preference] UNIQUE ([preference])
)
GO
INSERT INTO [rating] ([id], [importance], [preference])
VALUES
	(-1, N'Not Important', N'Dislike'),
	(0, N'Important', N'Neutral'),
	(1, N'Very Important', N'Like')
GO
CREATE TABLE [quality] (
	[id] INT NOT NULL IDENTITY (1, 1),
	[description] NVARCHAR(255) NOT NULL,
	CONSTRAINT [pk_quality] PRIMARY KEY ([id]),
	CONSTRAINT [uq_quality_description] UNIQUE CLUSTERED ([description])
)
GO
INSERT INTO [quality] ([description])
VALUES
	(N'Rhythm & Timing'),
	(N'Musicality'),
	(N'Connection'),
	(N'Technique'),
	(N'Repertoire of Moves'),
	(N'Aesthetics'),
	(N'Physique'),
	(N'Flamboyance'),
	(N'Physical Attraction'),
	(N'Age'),
	(N'Ethnicity'),
	(N'Gender'),
	(N'Enjoyment'),
	(N'Enthusiasm'),
	(N'Attentiveness'),
	(N'Empathy'),
	(N'Hygiene'),
	(N'Consideration'),
	(N'Versatility'),
	(N'Dress Sense')
GO
CREATE TABLE [importance] (
	[userId] NVARCHAR(255) NOT NULL,
	[qualityId] INT NOT NULL,
	[ratingId] INT NOT NULL,
	CONSTRAINT [pk_importance] PRIMARY KEY CLUSTERED ([userId], [qualityId]),
	CONSTRAINT [fk_importance_user] FOREIGN KEY ([userId]) REFERENCES [user] ([id]) ON DELETE CASCADE,
	CONSTRAINT [fk_importance_quality] FOREIGN KEY ([qualityId]) REFERENCES [quality] ([id]),
	CONSTRAINT [fk_importance_rating] FOREIGN KEY ([ratingId]) REFERENCES [rating] ([id])
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
	SELECT
		[id] = u.[id],
		[name] = u.[name],
		[demographics] = CONVERT(BIT, CASE WHEN d.[userId] IS NULL THEN 0 ELSE 1 END)
	FROM [user] u
		LEFT JOIN [demographic] d ON u.[id] = d.[userId]
	WHERE u.[id] = @id
	RETURN
END
GO
CREATE PROCEDURE [apiProfile](@userId NVARCHAR(255))
AS
BEGIN
	SET NOCOUNT ON
	SELECT
		d.[roleId],
		d.[ageId],
		d.[countryId]
	FROM [user] u
		LEFT JOIN [demographic] d ON u.[id] = d.[userId]
	WHERE u.[id] = @userId
	RETURN
END
GO
CREATE PROCEDURE [apiAge]
AS
BEGIN
	SET NOCOUNT ON
	SELECT [id], [description] FROM [age] ORDER BY [id]
	RETURN
END
GO
CREATE PROCEDURE [apiCountry]
AS
BEGIN
	SET NOCOUNT ON
	SELECT [id], [name] FROM [country] ORDER BY [name]
	RETURN
END
GO
CREATE PROCEDURE [apiQuality](@userId NVARCHAR(255))
AS
BEGIN
	SET NOCOUNT ON
	SELECT
		q.[id],
		q.[description],
		i.[ratingId]
	FROM [quality] q
		LEFT JOIN [importance] i ON i.[userId] = @userId AND q.[id] = i.[qualityId]
	ORDER BY q.[description]
	RETURN
END
GO