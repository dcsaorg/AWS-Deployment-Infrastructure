#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { DCSAStack } from '../lib/dcsa-stack'

const app = new cdk.App()

new DCSAStack(app, 'st', { "hostedZoneId": "Z0356896WKOUB3ZK0XRN"

})


app.synth()
