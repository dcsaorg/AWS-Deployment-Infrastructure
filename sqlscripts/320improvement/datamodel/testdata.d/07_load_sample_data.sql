\set ON_ERROR_STOP true
\connect :"dcsadbname"

BEGIN;

\copy dcsa_im_v3_0.carrier (carrier_name, smdg_code, nmfta_code) from 'sqlscripts/320improvement/datamodel/samples.d/carriers.csv' CSV HEADER
\copy dcsa_im_v3_0.country from 'sqlscripts/320improvement/datamodel/samples.d/countrycodes.csv' CSV HEADER
\copy dcsa_im_v3_0.un_location from 'sqlscripts/320improvement/datamodel/samples.d/unlocationcodes.csv' CSV HEADER
\copy dcsa_im_v3_0.facility (facility_name, un_location_code, facility_smdg_code) from 'sqlscripts/320improvement/datamodel/samples.d/facilities.csv' CSV HEADER
\copy dcsa_im_v3_0.hs_code from 'sqlscripts/320improvement/datamodel/samples.d/hscodes.csv' CSV HEADER
\copy dcsa_im_v3_0.smdg_delay_reason from 'sqlscripts/320improvement/datamodel/samples.d/smdgdelayreasoncodes.csv' CSV HEADER

-- Data only used by UI Support
\copy dcsa_im_v3_0.port_timezone from 'sqlscripts/320improvement/datamodel/samples.d/porttimezones.csv' CSV HEADER

COMMIT;