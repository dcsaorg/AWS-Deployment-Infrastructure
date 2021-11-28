#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { DCSAStack } from '../lib/dcsa-stack'

const app = new cdk.App()

new DCSAStack(app, 'st', { "hostedZoneId": process.env.HOSTEDZONEID ?? "", "baseUrl": process.env.BASEURL ?? "localhost",
"participants": (process.env.PARTICIPANTS ?? "{}"),
    "helmVersion": process.env.HELMVERSION ?? "0.1.38",
    "springMailUsername": process.env.SMTPUSERNAME ?? "",
    "experimental": process.env.EXPERIMENTAL ?? "",
    "dbpassword": process.env.DBPASSWORD ?? "",
    dbSnapshotID:  process.env.DBSNAPSHOTID ?? "",
    cognitoUserPoolId: process.env.DBSNAPSHOTID ?? "",
    cognitoDcsaClientId: process.env.DBSNAPSHOTID ?? "",
    cognitoDcsaClientSecret:process.env.DBSNAPSHOTID ?? "",
    cognitoTokenUrl:process.env.DBSNAPSHOTID ?? "",
    cognitoUiClientId:process.env.DBSNAPSHOTID ?? "",
    cognitoUiClientSecret:process.env.DBSNAPSHOTID ?? ""
})


app.synth()
