import {Construct} from '@aws-cdk/core'
import * as eks from '@aws-cdk/aws-eks'
import * as iam from '@aws-cdk/aws-iam'
import * as acm from '@aws-cdk/aws-certificatemanager'
import policyStatementActions from '../constants/policyStatementActions.constant'

export interface DCSAEKSClusterProps {
    hostedZoneCertificate: acm.ICertificate,
    cognitoUserPoolId: string,
    helmVersion: string,
    participants: string,
    springMailUsername: string,
    experimental:boolean
    cognitoUIClientId:string
    cognitoDCSAClientId:string,
    cognitoDCSAClientSecret:string,
    cognitoTokenUrl: string,
    dbHost:string,
    dbPort:number,
    dbPassword:string

}


export class DCSAEKSCluster extends Construct {
    constructor(scope: Construct, id: string, props: DCSAEKSClusterProps) {
        super(scope, id)

        const cluster = new eks.FargateCluster(this, 'cl', {
            version: eks.KubernetesVersion.V1_18,
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

        var helmChartname="dcsasandboxhamburg";

        let jsonStr = props.participants;
        let jsonObj = JSON.parse(jsonStr);
        let participantsArray = Array(0)
        Object.values(jsonObj).forEach((participant :any) => {
            participantsArray.push(participant["name"]);
            cluster.addHelmChart(participant["name"].substring(0, 3), {
                chart: helmChartname,
                repository: 'https://dcsaorg.github.io/Kubernetes-Packaging/',
                version: props.helmVersion,
                namespace: 'default',
                release: participant["name"].substring(0, 3),
                values: {
                    certificateArn: props.hostedZoneCertificate.certificateArn,
                    envType: {
                        aws: `${props.experimental!}`
                    },
                    env: {
                        baseurl: process.env.BASEURL,
                        participant: participant["name"]
                    },
                    db: {
                        host: props.dbHost,
                        password: props.dbPassword,
                        username: "postgres",
                        name: participant["name"].replace("-","")
                    },
                    p6config: {
                        company: participant["name"],
                        partyCode: participant["partycode"],
                        publisherRoles: participant["publisherroles"] ?? "[]",
                        cognitoUserPoolId: props.cognitoUserPoolId,
                        cognitoAppClientId: props.cognitoUIClientId,
                        publisherCodeType: "SMDG_LINER_CODE",
                        partyName: participant["name"],
                        springMailUsername: props.springMailUsername,
                        springMailPassword: process.env.SMTPPASSWORD,
                        notificationEmail: participant["email"],
                        dcsaAppClientId: props.cognitoDCSAClientId,
                        dcsaAppClientSecret: props.cognitoDCSAClientSecret,
                        dcsaAppClientTokenUri: props.cognitoTokenUrl
                    }
                }
            })
        })


            cluster.addHelmChart('el', {
                chart: 'dcsaingresscluster',
                repository: 'https://dcsaorg.github.io/Kubernetes-Packaging/',
                version: '0.0.3',
                namespace: 'default',
                values: {
                    certificateArn: props.hostedZoneCertificate.certificateArn,
                    env: {
                        baseurl: process.env.BASEURL
                    },
                    participants:participantsArray
                }
            })
        }

}
