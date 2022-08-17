import * as cdk from '@aws-cdk/core'
import { DCSARoute53 } from './constructs/route53.construct'
import { DCSAEKSCluster } from './constructs/eks-cluster.construct'
import { DBConstruct } from "./constructs/db.construct";
import { CfnOutput } from '@aws-cdk/core';


export interface DCSAStackProps extends cdk.StackProps { hostedZoneId: string,
    baseUrl: string
}

export class DCSAStack extends cdk.Stack {
  constructor (scope: cdk.Construct, id: string, props: DCSAStackProps) {
    super(scope, id, props)

    const { hostedZoneCertificate } = new DCSARoute53(this, 'Route53', { "hostedZoneId": props.hostedZoneId, "baseUrl": props.baseUrl})

      new DCSAEKSCluster(this, 'EKSCluster', {
      })

      new CfnOutput(this, 'hostedZoneCertificateArn', {
        value: hostedZoneCertificate.certificateArn
      });
  }
}
