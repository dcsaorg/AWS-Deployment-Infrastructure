import * as cdk from '@aws-cdk/core'
import { DCSARoute53 } from './constructs/route53.construct'
import { DCSAEKSCluster } from './constructs/eks-cluster.construct'
import { DBConstruct } from "./constructs/db.construct";
import { CfnOutput } from '@aws-cdk/core';


export interface DBStackProps extends cdk.StackProps {
    dbSnapshotID?:string,
}

export class DBStack extends cdk.Stack {
  constructor (scope: cdk.Construct, id: string, props: DBStackProps) {
    super(scope, id, props)

    new DBConstruct(this, "db", {snapshotId: props.dbSnapshotID});
  }
}
