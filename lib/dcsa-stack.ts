import * as cdk from '@aws-cdk/core'
import { DCSARoute53 } from './constructs/route53.construct'
import { DCSAEKSCluster } from './constructs/eks-cluster.construct'
import { DBConstruct } from "./constructs/db.construct";
import { CfnOutput } from '@aws-cdk/core';


export interface DCSAStackProps extends cdk.StackProps { hostedZoneId: string,
    baseUrl: string,
    participants: string,
    helmVersion: string,
    springMailUsername: string,
    experimental:string,
    dbpassword:string,
    dbSnapshotID?:string,
    cognitoUserPoolId: string,
    cognitoDcsaClientId: string,
    cognitoDcsaClientSecret:string,
    cognitoTokenUrl:string,
    cognitoUiClientId:string
}

export class DCSAStack extends cdk.Stack {
  constructor (scope: cdk.Construct, id: string, props: DCSAStackProps) {
    super(scope, id, props)

    const { hostedZoneCertificate } = new DCSARoute53(this, 'Route53', { "hostedZoneId": props.hostedZoneId, "baseUrl": props.baseUrl, "participants": props.participants})

    const {dbHostname,dbPort}= new DBConstruct(this, "db", {snapshotId: props.dbSnapshotID});
      new DCSAEKSCluster(this, 'EKSCluster', {
        hostedZoneCertificate,
        "cognitoUserPoolId": props.cognitoUserPoolId, 
        "helmVersion": props.helmVersion, 
        "participants": props.participants,
        "springMailUsername": props.springMailUsername,
        cognitoUIClientId: props.cognitoUiClientId,
        cognitoDCSAClientId:props.cognitoDcsaClientId,
        cognitoDCSAClientSecret: props.cognitoDcsaClientSecret,
        cognitoTokenUrl: props.cognitoTokenUrl,
        dbPort:dbPort,
        dbHost:dbHostname,
        dbPassword: props.dbpassword
      })

      new CfnOutput(this, 'hostedZoneCertificateArn', {
        value: hostedZoneCertificate.certificateArn
      });
  }
}
