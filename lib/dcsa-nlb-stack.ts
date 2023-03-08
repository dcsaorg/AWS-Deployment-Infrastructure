import * as cdk from '@aws-cdk/core'
import { DCSARoute53 } from './constructs/route53.construct'
import { DCSAEKSCluster } from './constructs/eks-cluster.construct'
import { DBConstruct } from "./constructs/db.construct";
import { CfnOutput } from '@aws-cdk/core';
import {DCSAAPIGateway} from "./apigateway-stack";
import {DCSAEKSNLBCluster} from "./constructs/eks-cluster-nlb.construct";


export interface DCSAStackProps extends cdk.StackProps { hostedZoneId: string,
    baseUrl: string,
    participants: string
}

export class DCSANLBStack extends cdk.Stack {
  constructor (scope: cdk.Construct, id: string, props: DCSAStackProps) {
    super(scope, id, props)



    //const { hostedZoneCertificate } = new DCSARoute53(this, 'Route53', { "hostedZoneId": props.hostedZoneId, "baseUrl": props.baseUrl, "participants": props.participants})

      new DCSAEKSNLBCluster(this, 'EKSCluster', {
      })

      /*new CfnOutput(this, 'hostedZoneCertificateArn', {
        value: hostedZoneCertificate.certificateArn
      });*/
  }
}
