#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { DCSAStack } from '../lib/dcsa-stack'

const app = new cdk.App()

new DCSAStack(app, 'st', { "hostedZoneId": process.env.HOSTEDZONEID ?? "", "baseUrl": process.env.BASEURL ?? "localhost",
"participants": (process.env.PARTICIPANTS ?? "none").split(",")
})


app.synth()
