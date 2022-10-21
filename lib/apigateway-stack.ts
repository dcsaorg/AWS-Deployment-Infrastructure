import {Construct, RemovalPolicy, Stack} from '@aws-cdk/core'
import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as apigateway from "@aws-cdk/aws-apigateway";
import {
    CognitoUserPoolsAuthorizer,
    EndpointType,
} from "@aws-cdk/aws-apigateway";
import * as acm from '@aws-cdk/aws-certificatemanager'
import * as route53 from '@aws-cdk/aws-route53'
import * as route53Targets from "@aws-cdk/aws-route53-targets";
import {OAuthScope} from "@aws-cdk/aws-cognito";

export interface DCSAAPIGatewayProps extends cdk.StackProps {
    baseUrl: string,
    hostedZoneId:string
}


export class DCSAAPIGateway extends cdk.Stack {
    constructor(scope: Construct, id: string, props: DCSAAPIGatewayProps) {
        super(scope, id)

        const pool=new cognito.UserPool(this, 'up', {
            selfSignUpEnabled: false,
            userPoolName: 'up',
            customAttributes: {
                groups: new cognito.StringAttribute({ minLen: 1, maxLen: 255 }),
            },
        });
        pool.applyRemovalPolicy(RemovalPolicy.DESTROY);

        const urlid=makeid(10);

        pool.addDomain('dg', {
            cognitoDomain: {
                domainPrefix: urlid,
            },
        });

        const resourceServer=pool.addResourceServer('upre',{
            identifier: "dcsa",
            scopes: [{
                scopeDescription: 'infosys',
                scopeName: 'infosys',
            }],
            userPoolResourceServerName:"ourresource"
        })


        let client=pool.addClient('cl', {
            generateSecret: true,
            oAuth: {
                flows: {
                    clientCredentials: true,
                },
                scopes: [OAuthScope.custom("dcsa/infosys")],
            }
        })
        client.node.addDependency(resourceServer)

        //Certificate

        var subdomain = "dev2"

        var domainname = subdomain+"." + props.baseUrl;

        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
            this,
            'zone',
            {
                hostedZoneId: props.hostedZoneId,
                zoneName: props.baseUrl
            }
        )

        // create the https certificate
        const certificate = new acm.DnsValidatedCertificate(this, "SiteCertificate", {
            domainName:domainname,
            hostedZone,
            subjectAlternativeNames: [],
            region: cdk.Aws.REGION,
        });


        const authorizer = new CognitoUserPoolsAuthorizer(
            this,
            "user-pool-authorizer",
            {
                cognitoUserPools: [pool],
            }
        );



        const api = new apigateway.RestApi(this, "secured-api", {
            restApiName: "Secured APIGateway",
            description: "This API is the secure apis",

            domainName: {
                domainName: domainname,
                certificate: certificate,
                endpointType: EndpointType.REGIONAL,
            },
        });

        new route53.ARecord(this, "apiDNS", {
            zone: hostedZone,
            recordName: subdomain,
            target: route53.RecordTarget.fromAlias(
                new route53Targets.ApiGateway(api)
            ),
        });



        const rootResource = api.root.addProxy({
            anyMethod: true,
            defaultIntegration:new apigateway.HttpIntegration('http://amazon.com'),
            defaultMethodOptions: {
                authorizer: authorizer,
                authorizationType: apigateway.AuthorizationType.COGNITO,
                authorizationScopes: ["dcsa/infosys"]
            }
        })
        /*rootResource.
        rootResource.addMethod("ANY",
            new apigateway.HttpIntegration('http://amazon.com/{proxy}'),
            {
                authorizer: authorizer,
                authorizationType: apigateway.AuthorizationType.COGNITO,
                authorizationScopes: ["dcsa/infosys"]
            })*/
    }
}

function makeid(length:number) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}