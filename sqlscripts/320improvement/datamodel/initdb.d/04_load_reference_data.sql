-- Assumes the PSQL client
\set ON_ERROR_STOP true
\connect :"dcsadbname"

-- Use a transaction so a bug will not leave tainted / incomplete data.
BEGIN;

\copy dcsa_im_v3_0.facility_type from 'sqlscripts/320improvement/datamodel/referencedata.d/facilitytypes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.seal_source from 'sqlscripts/320improvement/datamodel/referencedata.d/sealsourcecodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.seal_type from 'sqlscripts/320improvement/datamodel/referencedata.d/sealtypecodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.shipment_location_type from 'sqlscripts/320improvement/datamodel/referencedata.d/shipmentlocationtypes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.party_function from 'sqlscripts/320improvement/datamodel/referencedata.d/partyfunctioncodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.reference_type from 'sqlscripts/320improvement/datamodel/referencedata.d/referencetypes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.receipt_delivery_type from 'sqlscripts/320improvement/datamodel/referencedata.d/receiptdeliverytypes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.cargo_movement_type from 'sqlscripts/320improvement/datamodel/referencedata.d/cargomovementtypes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.mode_of_transport from 'sqlscripts/320improvement/datamodel/referencedata.d/modeoftransportcodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.transport_document_type from 'sqlscripts/320improvement/datamodel/referencedata.d/transportdocumenttypecodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.shipment_event_type from 'sqlscripts/320improvement/datamodel/referencedata.d/shipmenteventtypecodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.event_classifier from 'sqlscripts/320improvement/datamodel/referencedata.d/eventclassifiercodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.equipment_event_type from 'sqlscripts/320improvement/datamodel/referencedata.d/equipmenteventtypecodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.document_type from 'sqlscripts/320improvement/datamodel/referencedata.d/documenttypecodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.transport_event_type from 'sqlscripts/320improvement/datamodel/referencedata.d/transporteventtypecodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.empty_indicator from 'sqlscripts/320improvement/datamodel/referencedata.d/emptyindicatorcodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.operations_event_type from 'sqlscripts/320improvement/datamodel/referencedata.d/operationseventtypecodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.port_call_service_type from 'sqlscripts/320improvement/datamodel/referencedata.d/portcallservicetypecodes.csv' with NULL AS E'\'\'' CSV HEADER
\copy dcsa_im_v3_0.code_list_responsible_agency from 'sqlscripts/320improvement/datamodel/referencedata.d/codelistresponsibleagencycodes.csv' with NULL AS E'\'\'' CSV HEADER

COMMIT;
