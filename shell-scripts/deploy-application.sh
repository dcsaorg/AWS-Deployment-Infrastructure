#!/usr/bin/env bash

aws cloudformation describe-stacks --stack-name st > stack-out.json
jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("ConfigCommand")) | .OutputValue' stack-out.json > ./kube.sh
. ./kube.sh

helm repo add dcsa https://dcsaorg.github.io/Kubernetes-Packaging/

certificateArn=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("hostedZoneCertificateArn")) | .OutputValue' stack-out.json)
dbHostName=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("dbdbEndpointHostname")) | .OutputValue' stack-out.json)
dcsaAppClientId=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("dcsaAppClientId")) | .OutputValue' stack-out.json)
dcsaAppClientSecret=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("dcsaAppClientSecret")) | .OutputValue' stack-out.json)
dcsaAppClientTokenUri=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("dcsaAppClientTokenUri")) | .OutputValue' stack-out.json)

participantNames=$(echo "$PARTICIPANTS" | jq -r '.[].name')
for participant in $participantNames; do
    echo "Creating values values.yml for $participant"

    participantTrimmed=$(echo $participant | tr -d '-')
    partycode=$(echo "$PARTICIPANTS" | jq -r ".[] | select(.name|test(\"$participant\")) | .partycode")
    publisherroles=$(echo "$PARTICIPANTS" | jq -r ".[] | select(.name|test(\"$participant\")) | .publisherroles")
    email=$(echo "$PARTICIPANTS" | jq -r ".[] | select(.name|test(\"$participant\")) | .email")

    cat <<EOF >> values.yml
certificateArn: "$certificateArn"

env:
    baseurl: "$BASEURL"
    participant: "$participant"

db:
    host: "$dbHostName"
    username: "$DB_USER"
    password: "$DB_PASSWORD"
    name: "$participantTrimmed"

p6config:
    company: "$participant"
    partyCode: "$partyCode"
    publisherRoles: "$publisherroles"
    cognitoUserPoolId: "$COGNITOUSERPOOLID"
    cognitoAppClientId: "$COGNITOAPPCLIENTID"
    publisherCodeType: "SMDG_LINER_CODE"
    partyName: "$participant"
    springMailUsername: "$SMTPUSERNAME"
    springMailPassword: "$SMTPPASSWORD"
    notificationEmail: "$email"
    dcsaAppClientId: "$dcsaAppClientId"
    dcsaAppClientSecret: "$dcsaAppClientSecret"
    dcsaAppClientTokenUri: "$dcsaAppClientTokenUri"
EOF

    echo "Deploying helm for $participant $partycode $publisherroles"
    helm install "$participant" dcsa/dcsasandboxhamburg --values values.yml
done

helm list
