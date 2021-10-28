import * as cdk from '@aws-cdk/core'
import { DCSARoute53 } from './constructs/route53.construct'
import { DCSAEKSCluster } from './constructs/eks-cluster.construct'
import { DBConstruct } from "./constructs/db.construct";

export interface DCSAStackProps extends cdk.StackProps { hostedZoneId: string, baseUrl: string, participants: string, cognitoUserPoolId: string, helmVersion: string, springMailUsername: string}

export class DCSAStack extends cdk.Stack {
  constructor (scope: cdk.Construct, id: string, props: DCSAStackProps) {
    super(scope, id, props)

    const { hostedZoneCertificate } = new DCSARoute53(this, 'Route53', { "hostedZoneId": props.hostedZoneId, "baseUrl": props.baseUrl, "participants": props.participants})

    new DBConstruct(this, "db",{"placeholder":"placeholdertext"});

    new DCSAEKSCluster(this, 'EKSCluster', {
      hostedZoneCertificate, "cognitoUserPoolId": props.cognitoUserPoolId, "helmVersion": props.helmVersion, "participants": props.participants, "springMailUsername": props.springMailUsername
    })
  }
}
