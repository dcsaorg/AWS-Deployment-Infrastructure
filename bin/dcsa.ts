#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { DCSAStack } from '../lib/dcsa-stack'
import { CognitoStack } from '../lib/cognito-stack'
import {DBStack} from "../lib/db-stack";
import { DCSAProviderCtkStack } from '../lib/dcsa-provider-ctk-stack'

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
    participants: (process.env.PARTICIPANTS ?? "{}")
})

new DBStack(app, 'db', {
    dbSnapshotID:  process.env.DBSNAPSHOTID ?? "",
})

new DCSAProviderCtkStack(app, 'ctkst', { "hostedZoneId": process.env.HOSTEDZONEID ?? "", "baseUrl": process.env.BASEURL ?? "localhost"
})

app.synth()
