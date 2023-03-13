#!/usr/bin/env bash

aws cloudformation describe-stacks --stack-name stnlb > st-stack-out.json
jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("ConfigCommand")) | .OutputValue' st-stack-out.json > ./kube.sh
. ./kube.sh

certificateArn=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("hostedZoneCertificateArn")) | .OutputValue' st-stack-out.json)


    cat <<EOF >> values.yml
certificateArn: "$certificateArn"

env:
    baseurl: "$BASEURL"
    participant: "dcsa"


EOF

    echo "Deploying helm for dcsa"
    helm upgrade --install "dcsa" ./charts/ap-booking --values values.yml





helm list
