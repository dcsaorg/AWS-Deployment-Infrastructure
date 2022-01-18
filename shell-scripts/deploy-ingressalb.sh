#!/usr/bin/env bash

aws cloudformation describe-stacks --stack-name st > stack-out.json
jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("ConfigCommand")) | .OutputValue' stack-out.json > ./kube.sh
. ./kube.sh

helm repo add dcsa https://dcsaorg.github.io/Kubernetes-Packaging/

certificateArn=$(jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("hostedZoneCertificateArn")) | .OutputValue' stack-out.json)
participantNames=$(echo "$PARTICIPANTS" | jq -r '.[].name')

echo "Creating values values.yml"

cat <<EOF >> values.yml
certificateArn: "$certificateArn"

env:
    baseurl: "$BASEURL"
    participants: ["first", "second"]
EOF

for p in $participantNames; do
    cat <<EOF >> values-2.yml
      - $p
EOF
done

#cat values-*.yml > values.yml
#rm values-*.yml
cat values.yml
echo "Deploying ingress helm for"
helm uninstall ingressdcsa
helm uninstall ingress
helm upgrade --install --dry-run ingressdcsa dcsa/dcsaingresscluster --values values.yml --version v0.0.3


helm list
