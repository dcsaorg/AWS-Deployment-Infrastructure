#!/usr/bin/env bash

if [ -z "$EXISTING_USERPOOLID" ]; then
    if ! userPoolId=$(aws --output json cognito-idp list-user-pools --max-results=20 | jq -re '.UserPools[] | select(.Name=="up") | .Id'); then
        echo "No userpools named 'up'"
        echo "::set-output name=userPoolId::"
        echo "::set-output name=tokenUrl::"
        echo "::set-output name=dcsaClientId::"
        echo "::set-output name=dcsaClientSecret::"
        echo "::set-output name=uiClientId::"
        exit 0
    fi

    if domain=$(aws --output json cognito-idp describe-user-pool --user-pool-id $userPoolId | jq -re '.UserPool.Domain'); then
        tokenUrl="https://${domain}.auth.eu-west-1.amazoncognito.com/oauth2/token"
    else
        echo "UserPool '$userPoolId' has no domain"
        exit 1
    fi

    clients=$(aws --output json cognito-idp list-user-pool-clients --user-pool-id $userPoolId)
    clientIds=$(echo "$clients" | jq -r '.UserPoolClients[].ClientId')
    for clientId in $clientIds; do
        clientName=$(echo "$clients" | jq -r ".UserPoolClients[] | select(.ClientId==\"$clientId\") | .ClientName")
        if [[ "$clientName" =~ "cgupcldcsa" ]]; then
            dcsaClientId=$clientId
        elif [[ "$clientName" =~ "cgupclui" ]]; then
            uiClientId=$clientId
        fi
        #aws --output json cognito-idp describe-user-pool-client --user-pool-id $userPoolId --client-id $clientId
    done
fi

[ -z "$userPoolId" ] && userPoolId="$EXISTING_USERPOOLID"
[ -z "$tokenUrl" ] && tokenUrl="$EXISTING_TOKENURL"
[ -z "$dcsaClientId" ] && dcsaClientId="$EXISTING_DCSACLIENTID"
[ -z "$uiClientId" ] && uiClientId="$EXISTING_UICLIENTID"

echo "::set-output name=userPoolId::$userPoolId"
echo "::set-output name=tokenUrl::$tokenUrl"
echo "::set-output name=dcsaClientId::$dcsaClientId"
echo "::set-output name=dcsaClientSecret::$EXISTING_DCSACLIENTSECRET"
echo "::set-output name=uiClientId::$uiClientId"
