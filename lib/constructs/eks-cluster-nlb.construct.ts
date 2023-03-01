import {Construct} from '@aws-cdk/core'
import * as eks from '@aws-cdk/aws-eks'
import * as iam from '@aws-cdk/aws-iam'
import * as acm from '@aws-cdk/aws-certificatemanager'
import policyStatementActions from '../constants/policyStatementActions.constant'
import * as alb from "@aws-cdk/aws-elasticloadbalancingv2";
import * as targets from "@aws-cdk/aws-elasticloadbalancingv2-targets";
import * as apigateway from "@aws-cdk/aws-apigateway";
import {ApplicationLoadBalancer, NetworkLoadBalancer} from "@aws-cdk/aws-elasticloadbalancingv2";

export interface DCSAEKSClusterProps {
}


export class DCSAEKSNLBCluster extends Construct {
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

        const alb = new ApplicationLoadBalancer(this, 'alb', {
            vpc: cluster.vpc,
            internetFacing: true,
        });

        const listenerALB = alb.addListener('Listener', {
            port: 80,
            open: true,
        });

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

        const nlb = new NetworkLoadBalancer(this, 'Nlb', {
            vpc: cluster.vpc,
            crossZoneEnabled: true,
            internetFacing: false,
        });

        const listener = nlb.addListener('listener', { port: 80 });

        listener.addTargets('Targets', {
            targets: [new targets.AlbArnTarget(alb.loadBalancerArn, 80)],
            port: 80,
        });

        const link = new apigateway.VpcLink(this, 'link', {
            targets: [nlb],
        });

        const integration = new apigateway.Integration({
            type: apigateway.IntegrationType.HTTP_PROXY,
            options: {
                connectionType: apigateway.ConnectionType.VPC_LINK,
                vpcLink: link,
            },
        });
    }
}
