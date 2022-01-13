#!/usr/bin/env bash

aws cloudformation describe-stacks --stack-name st > stack-out.json
jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("ConfigCommand")) | .OutputValue' stack-out.json > ./kube.sh
. ./kube.sh

kubectl create secret generic database-credentials --from-literal=user="$DB_USER" --from-literal=password="$DB_PASSWORD" || true
kubectl create secret generic smtp-credentials --from-literal=user="$SMTP_USER" --from-literal=password="$SMTP_PASSWORD" || true
