import * as cdk from 'aws-cdk-lib/core'
import {Construct } from 'constructs'
import { DCSARoute53 } from './constructs/route53.construct'
import { DCSAEKSCluster } from './constructs/eks-cluster.construct'
import { DBConstruct } from "./constructs/db.construct";
import { CfnOutput } from 'aws-cdk-lib/core';


export interface DBStackProps extends cdk.StackProps {
    dbSnapshotID?:string,
}

export class DBStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props: DBStackProps) {
    super(scope, id, props)

    new DBConstruct(this, "db", {snapshotId: props.dbSnapshotID});
  }
}
