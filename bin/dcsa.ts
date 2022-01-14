#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { DCSAStack } from '../lib/dcsa-stack'
import { CognitoStack } from '../lib/cognito-stack'

const app = new cdk.App()

const cognitoStack = new CognitoStack(app, 'cognito', {
    existingUserPoolId: process.env.EXISTING_USERPOOLID,
    existingUiClientId: process.env.EXISTING_UICLIENTID,
    existingDcsaClientId: process.env.EXISTING_DCSACLIENTID,
    existingDcsaClientSecret: process.env.EXISTING_DCSACLIENTSECRET,
    existingTokenUrl: process.env.EXISTING_TOKENURL,
    participants: (process.env.PARTICIPANTS ?? "{}")
})

new DCSAStack(app, 'st', { "hostedZoneId": process.env.HOSTEDZONEID ?? "", "baseUrl": process.env.BASEURL ?? "localhost",
    participants: (process.env.PARTICIPANTS ?? "{}"),
    "helmVersion": process.env.HELMVERSION ?? "0.1.38",
    "springMailUsername": process.env.SMTPUSERNAME ?? "",
    "experimental": process.env.EXPERIMENTAL ?? "",
    "dbpassword": process.env.DBPASSWORD ?? "",
    dbSnapshotID:  process.env.DBSNAPSHOTID ?? "",
    cognitoUserPoolId: cognitoStack.userPoolId,
    cognitoDcsaClientId: cognitoStack.dcsaClientId,
    cognitoDcsaClientSecret: cognitoStack.dcsaClientSecret,
    cognitoTokenUrl: cognitoStack.tokenUrl,
    cognitoUiClientId: cognitoStack.uiClientId
})

app.synth()
