\set ON_ERROR_STOP true
\connect :"dcsadbname"

BEGIN;

SELECT 'Start: 07_load_sample_data.sql...' as progress;

\copy dcsa_im_v3_0.carrier (carrier_name, smdg_code, nmfta_code) from 'sqlscripts/newscripts2/datamodel/samples.d/carriers.csv' CSV HEADER
\copy dcsa_im_v3_0.country from 'sqlscripts/newscripts2/datamodel/samples.d/countrycodes.csv' CSV HEADER
\copy dcsa_im_v3_0.un_location from 'sqlscripts/newscripts2/datamodel/samples.d/unlocationcodes.csv' CSV HEADER
\copy dcsa_im_v3_0.facility (facility_name, un_location_code, facility_smdg_code, facility_bic_code) from 'sqlscripts/newscripts2/datamodel/samples.d/facilities.csv' CSV HEADER
\copy dcsa_im_v3_0.hs_code from 'sqlscripts/newscripts2/datamodel/samples.d/hscodes.csv' CSV HEADER
\copy dcsa_im_v3_0.smdg_delay_reason from 'sqlscripts/newscripts2/datamodel/samples.d/smdgdelayreasoncodes.csv' CSV HEADER

-- Used in our implementation of JIT
\copy dcsa_im_v3_0.negotiation_cycle from 'sqlscripts/newscripts2/datamodel/samples.d/negotiationcycles.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.port_call_part from 'sqlscripts/newscripts2/datamodel/samples.d/portcallpart.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.publisher_pattern from 'sqlscripts/newscripts2/datamodel/samples.d/publisherpattern.csv' with NULL AS 'null' CSV HEADER
\copy dcsa_im_v3_0.timestamp_definition from 'sqlscripts/newscripts2/datamodel/samples.d/timestampdefinitions.csv' with NULL AS 'null' CSV HEADER
\copy dcsa_im_v3_0.timestamp_definition_publisher_pattern from 'sqlscripts/newscripts2/datamodel/samples.d/timestampdefinitions_publisherpattern.csv' with NULL AS 'null' CSV HEADER

-- Data only used by UI Support
\copy dcsa_im_v3_0.port_timezone from 'sqlscripts/newscripts2/datamodel/samples.d/porttimezones.csv' CSV HEADER

SELECT 'End: 07_load_sample_data.sql' as progress;

COMMIT;
