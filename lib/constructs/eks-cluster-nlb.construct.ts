import {Construct} from 'constructs'
import * as eks from 'aws-cdk-lib/aws-eks'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import policyStatementActions from '../constants/policyStatementActions.constant'
import * as alb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as targets from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {
    ApplicationLoadBalancer,
    ListenerAction,
    NetworkLoadBalancer
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {EndpointType} from "aws-cdk-lib/aws-apigateway";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";

export interface DCSAEKSClusterProps {

    baseurl: string,
    hostedZoneId:string,

}


export class DCSAEKSNLBCluster extends Construct {
    constructor(scope: Construct, id: string, props: DCSAEKSClusterProps) {
        super(scope, id)

        const cluster = new eks.FargateCluster(this, 'cl', {
            version: eks.KubernetesVersion.V1_24,
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

        //The real alb is not accessible until the helm charts are installed..
        const alb = new ApplicationLoadBalancer(this, 'alb', {
            vpc: cluster.vpc,
            internetFacing: false,
        });

        const listenerALB = alb.addListener('Listener', {
            port: 80,
            open: true,
        });



        listenerALB.addAction('DefaultAction', {
            action: ListenerAction.fixedResponse(404, {
                contentType: 'text/plain',
                messageBody: 'Cannot route your request; no matching project found.',
            }),
        });

        cluster.addHelmChart('ALBController', {
            chart: 'aws-load-balancer-controller',
            repository: 'https://aws.github.io/eks-charts',
            namespace: 'kube-system',
            version: '1.4.8',
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


        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
            this,
            'dcsaHostedZone',
            {
                hostedZoneId: props.hostedZoneId,
                zoneName: props.baseurl
            }
        )

        // @ts-ignore
        const hostedZoneCertificate = new acm.Certificate(
            this,
            'dcsaCertificate',
            {
                domainName: '*.'+props.baseurl,
                subjectAlternativeNames: [],
                validation: acm.CertificateValidation.fromDns(hostedZone)
            }
        )


        const domainname='api.'+props.baseurl


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

        const api = new apigateway.RestApi(this, "secured-api", {
            restApiName: "Secured APIGateway",
            description: "This API is the secure apis",

            domainName: {
                domainName: domainname,
                certificate: hostedZoneCertificate,
                endpointType: EndpointType.REGIONAL,
            },
        });

        new route53.ARecord(this, "apiDNS", {
            zone: hostedZone,
            recordName: domainname,
            target: route53.RecordTarget.fromAlias(
                new route53Targets.ApiGateway(api)
            ),
        });



        const rootResource = api.root.addProxy({
            anyMethod: true,
            defaultIntegration:integration,
            /*defaultMethodOptions: {
                authorizer: authorizer,
                authorizationType: apigateway.AuthorizationType.COGNITO,
                authorizationScopes: ["dcsa/infosys"]
            }*/
        })
        
    }
}
