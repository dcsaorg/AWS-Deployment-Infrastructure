#!/usr/bin/env bash

aws cloudformation describe-stacks --stack-name st > st-stack-out.json
aws cloudformation describe-stacks --stack-name cognito > cognito-stack-out.json
aws cloudformation describe-stacks --stack-name db > db-stack-out.json
jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("ConfigCommand")) | .OutputValue' st-stack-out.json > ./kube.sh
. ./kube.sh

dbHostName=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("dbEndpointHostname")) | .OutputValue' db-stack-out.json)
certificateArn=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("hostedZoneCertificateArn")) | .OutputValue' st-stack-out.json)


    cat <<EOF >> values.yml
certificateArn: "$certificateArn"

env:
    baseurl: "$BASEURL"
    participant: "dcsa"

db:
    host: "$dbHostName"
    username: "$DB_USER"
    password: "$DB_PASSWORD"
    name: "dcsa"

EOF

    echo "Deploying helm for dcsa"
    helm upgrade --install "dcsa" --values values.yml --set-string imageCredentials.password=$GITHUBPACKAGETOKEN

helm list
