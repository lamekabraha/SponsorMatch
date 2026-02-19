-- Run this migration if branding upload fails with "Data too long" error.
-- Storage URLs are typically 80-150 chars; CompanyLogo varchar(45) is too short.

ALTER TABLE sponsor_match.account
  MODIFY COLUMN CompanyLogo VARCHAR(500) DEFAULT NULL,
  MODIFY COLUMN CompanyCover VARCHAR(500) DEFAULT NULL;
