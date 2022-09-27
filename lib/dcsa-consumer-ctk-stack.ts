import * as cdk from '@aws-cdk/core'
import { DCSARoute53 } from './constructs/route53.construct'
import { CfnOutput } from '@aws-cdk/core';
import { DCSAConsumerCtkCluster } from './constructs/consumer-ctk-cluster.construct';


export interface DCSAConsumerCtkProps extends cdk.StackProps { hostedZoneId: string,
    baseUrl: string
}

export class DCSAConsumerCtkStack extends cdk.Stack {
  constructor (scope: cdk.Construct, id: string, props: DCSAConsumerCtkProps) {
    super(scope, id, props)

    const { hostedZoneCertificate } = new DCSARoute53(this, 'Route53', { "hostedZoneId": props.hostedZoneId, "baseUrl": props.baseUrl,participants:"[]"})

      new DCSAConsumerCtkCluster(this, 'ConsumerCtkCluster', {
      })

      new CfnOutput(this, 'hostedZoneCertificateArn', {
        value: hostedZoneCertificate.certificateArn
      });
  }
}
