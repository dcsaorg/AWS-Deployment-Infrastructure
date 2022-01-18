#!/usr/bin/env bash

aws cloudformation describe-stacks --stack-name st > stack-out.json
jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("ConfigCommand")) | .OutputValue' stack-out.json > ./kube.sh
. ./kube.sh

helm repo add dcsa https://dcsaorg.github.io/Kubernetes-Packaging/

certificateArn=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("hostedZoneCertificateArn")) | .OutputValue' stack-out.json)
participantNames=$(echo "$PARTICIPANTS" | jq -r '.[].name')

echo "Creating values values.yml for $participantNames"

    participantTrimmed=$(echo $participant | tr -d '-')
    partycode=$(echo "$PARTICIPANTS" | jq -r ".[] | select(.name|test(\"$participant\")) | .partycode")
    publisherroles=$(echo "$PARTICIPANTS" | jq -r ".[] | select(.name|test(\"$participant\")) | .publisherroles")
    email=$(echo "$PARTICIPANTS" | jq -r ".[] | select(.name|test(\"$participant\")) | .email")

    cat <<EOF >> values.yml
certificateArn: "$certificateArn"

env:
    baseurl: "$BASEURL"
    participants: "$participant"
EOF
cat values.yml
echo "Deploying ingress helm for $participantNames"
helm install ingressdcsa dcsa/dcsaingresscluster --values values.yml


helm list
