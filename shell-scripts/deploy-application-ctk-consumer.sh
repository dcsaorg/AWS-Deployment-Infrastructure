#!/usr/bin/env bash

aws cloudformation describe-stacks --stack-name st > st-stack-out.json
aws cloudformation describe-stacks --stack-name cognito > cognito-stack-out.json
aws cloudformation describe-stacks --stack-name db > db-stack-out.json
jq -r '.Stacks[0].Outputs[] | select(.OutputKey|test("ConfigCommand")) | .OutputValue' st-stack-out.json > ./kube.sh
. ./kube.sh

helm list