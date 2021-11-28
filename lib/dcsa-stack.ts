import * as cdk from '@aws-cdk/core'
import { DCSARoute53 } from './constructs/route53.construct'
import { DCSAEKSCluster } from './constructs/eks-cluster.construct'
import { DBConstruct } from "./constructs/db.construct";
import {CognitoConstruct} from "./constructs/cognito.construct";


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
    cognitoUiClientId:string,
    cognitoUiClientSecret:string
}

export class DCSAStack extends cdk.Stack {
  constructor (scope: cdk.Construct, id: string, props: DCSAStackProps) {
    super(scope, id, props)

    const { hostedZoneCertificate } = new DCSARoute53(this, 'Route53', { "hostedZoneId": props.hostedZoneId, "baseUrl": props.baseUrl, "participants": props.participants})

    let experimental=false;
    if(props.experimental==='true') {
      experimental=true;
    }


    const { tokenUrl,dcsaClientSecret,dcsaClientId,uiClientId,cognitoUserPoolId } =  new CognitoConstruct(this, "cg", {
        participants: props.participants,
        cognitoUserPoolId: props.cognitoUserPoolId,
        dcsaClientId: props.cognitoDcsaClientId,
        dcsaClientSecret: props.cognitoDcsaClientSecret,
        tokenUrl:props.cognitoTokenUrl,
        uiClientId: props.cognitoUiClientId,
        uiClientSecret: props.cognitoUiClientSecret
    });


   const {dbHostname,dbPort}= new DBConstruct(this, "db", {snapshotId: props.dbSnapshotID});
      new DCSAEKSCluster(this, 'EKSCluster', {
        hostedZoneCertificate, "cognitoUserPoolId": cognitoUserPoolId, "helmVersion": props.helmVersion, "participants": props.participants, "springMailUsername": props.springMailUsername,experimental: experimental,cognitoUIClientId: uiClientId,cognitoDCSAClientId:dcsaClientId,cognitoDCSAClientSecret:dcsaClientSecret,cognitoTokenUrl:tokenUrl,dbPort:dbPort,dbHost:dbHostname,dbPassword: props.dbpassword
      })
  }
}
