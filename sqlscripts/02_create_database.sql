-- Database setup script
-- Needs to be executed by user postgres or equivalent
\set ON_ERROR_STOP true

-- Cannot be done in a transaction
DROP DATABASE IF EXISTS :"dcsadbname";
CREATE DATABASE :"dcsadbname"; --OWNER dcsa_db_owner;
\connect :"dcsadbname"

BEGIN;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Used to generate UUIDs
CREATE SCHEMA IF NOT EXISTS dcsa_im_v3_0;
--GRANT ALL PRIVILEGES ON DATABASE :"dcsadbname" TO dcsa_db_owner;
--GRANT ALL PRIVILEGES ON SCHEMA dcsa_im_v3_0 TO dcsa_db_owner;
--ALTER DEFAULT PRIVILEGES IN SCHEMA dcsa_im_v3_0 GRANT ALL ON TABLES TO dcsa_db_owner;
COMMIT;
