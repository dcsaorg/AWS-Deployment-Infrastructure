import {Construct} from '@aws-cdk/core'
import * as eks from '@aws-cdk/aws-eks'
import * as iam from '@aws-cdk/aws-iam'
import * as acm from '@aws-cdk/aws-certificatemanager'
import policyStatementActions from '../constants/policyStatementActions.constant'

export interface DCSAEKSClusterProps {
    hostedZoneCertificate: acm.ICertificate,
    cognitoUserPoolId: string,
    helmVersion: string,
    participants: string
}


export class DCSAEKSCluster extends Construct {
    constructor(scope: Construct, id: string, props: DCSAEKSClusterProps) {
        super(scope, id)

        const cluster = new eks.FargateCluster(this, 'cl', {
            version: eks.KubernetesVersion.V1_18,
            clusterName: 'cl'
        })

        let participantsMap = new Map(Object.entries(props.participants));

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

        participantsMap.forEach((value: string, key: string) => {
                cluster.addHelmChart(key.substring(0, 2), {
                    chart: 'dcsasandboxhamburg',
                    repository: 'https://dcsaorg.github.io/Kubernetes-Packaging/',
                    version: props.helmVersion,
                    namespace: 'default',
                    values: {
                        certificateArn: props.hostedZoneCertificate.certificateArn,
                        envType: {
                            aws: true
                        },
                        env: {
                            baseurl: process.env.BASEURL,
                            participant: key
                        },
                        p6config: {
                            company: key,
                            publisherRole: "CA",
                            cognitoUserPoolId: props.cognitoUserPoolId,
                            cognitoAppClientId: process.env.COGNITOAPPCLIENTID,
                            publisherCodeType: "SMDG_LINER_CODE",
                            partyName: key,
                            springMailPassword: process.env.HAMBURGDEVspringMailPassword,
                            notificationEmail: value
                        }
                    }
                })
            }
        )
    }
}
