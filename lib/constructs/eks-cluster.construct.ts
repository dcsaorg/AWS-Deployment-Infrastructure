import {Construct} from '@aws-cdk/core'
import * as eks from '@aws-cdk/aws-eks'
import * as iam from '@aws-cdk/aws-iam'
import * as acm from '@aws-cdk/aws-certificatemanager'
import policyStatementActions from '../constants/policyStatementActions.constant'

export interface DCSAEKSClusterProps {
}


export class DCSAEKSCluster extends Construct {
    constructor(scope: Construct, id: string, props: DCSAEKSClusterProps) {
        super(scope, id)

        const cluster = new eks.FargateCluster(this, 'cl', {
            version: eks.KubernetesVersion.V1_21,
            clusterName: 'cl'
        })
       const policyStatement = new iam.PolicyStatement({
            resources: ['*'],
            actions: policyStatementActions
        })

        const adminStatement = new iam.PolicyStatement({
            resources: ['*'],
            actions: ['*']
        })

        const account = cluster.addServiceAccount('ALBController', {
            name: 'aws-load-balancer-controller',
            namespace: 'kube-system'
        })

        account.addToPrincipalPolicy(policyStatement)
        account.addToPrincipalPolicy(adminStatement)

        cluster.addHelmChart('ALBController', {
            chart: 'aws-load-balancer-controller',
            repository: 'https://aws.github.io/eks-charts',
            namespace: 'kube-system',
            version: '1.4.0',
            release: 'aws-load-balancer-controller',
            values: {
                region: 'eu-west-1',
                vpcId: cluster.vpc.vpcId,
                clusterName: cluster.clusterName,
                serviceAccount: {
                    create: false,
                    name: account.serviceAccountName
                }
            }
        })
    }
}
