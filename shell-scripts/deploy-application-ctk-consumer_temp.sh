#!/usr/bin/env bash

aws cloudformation describe-stacks --stack-name st > st-stack-out.json
aws cloudformation describe-stacks --stack-name cognito > cognito-stack-out.json
aws cloudformation describe-stacks --stack-name db > db-stack-out.json
jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("ConfigCommand")) | .OutputValue' st-stack-out.json > ./kube.sh
. ./kube.sh

helm repo add postgresql https://charts.bitnami.com/bitnami
helm install postgresql postgresql/postgresql --values ctk/charts/valuesps.yml



certificateArn=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("hostedZoneCertificateArn")) | .OutputValue' st-stack-out.json)
dbHostName=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("dbEndpointHostname")) | .OutputValue' db-stack-out.json)

userPoolId=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("userPoolId")) | .OutputValue' cognito-stack-out.json)
tokenUrl=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("tokenUrl")) | .OutputValue' cognito-stack-out.json)
dcsaClientId=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("dcsaClientId")) | .OutputValue' cognito-stack-out.json)
dcsaClientSecret=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("dcsaClientSecret")) | .OutputValue' cognito-stack-out.json)
uiClientId=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("uiClientId")) | .OutputValue' cognito-stack-out.json)

participant="dcsa"

    echo "Creating values values.yml for $participant"

    participantTrimmed=$(echo $participant | tr -d '-')
    partycode=""
    publisherroles=""
    email=""

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
    publisherCodeType: "SMDG_LINER_CODE"
    partyName: "$participant"
    springMailUsername: "$SMTPUSERNAME"
    springMailPassword: "$SMTPPASSWORD"
    notificationEmail: "$email"
    cognitoUserPoolId: "$userPoolId"
    cognitoAppClientId: "$uiClientId"
    dcsaAppClientId: "$dcsaClientId"
    dcsaAppClientSecret: "$dcsaClientSecret"
    dcsaAppClientTokenUri: "$tokenUrl"
    dockerImageTag: "$DOCKERIMAGETAG"

tntconfig:
    company: "$participant"
    partyCode: "$partyCode"
    publisherRoles: "$publisherroles"
    publisherCodeType: "SMDG_LINER_CODE"
    partyName: "$participant"
    cognitoUserPoolId: "$userPoolId"
    cognitoAppClientId: "$uiClientId"
    dcsaAppClientId: "$dcsaClientId"
    dcsaAppClientSecret: "$dcsaClientSecret"
    dcsaAppClientTokenUri: "$tokenUrl"
    dockerImageTag: "$DOCKERIMAGETAG"

EOF

    echo "Deploying helm for $participant $partycode $publisherroles"
    helm install "$participant" dcsa/$HELMCHARTNAME --values values.yml


helm list
