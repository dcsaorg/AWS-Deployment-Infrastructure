import {Construct} from '@aws-cdk/core'
import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as apigateway from "@aws-cdk/aws-apigateway";
import {
    CognitoUserPoolsAuthorizer,
    EndpointType,
} from "@aws-cdk/aws-apigateway";
import * as acm from '@aws-cdk/aws-certificatemanager'
import * as route53 from '@aws-cdk/aws-route53'

export interface DCSAAPIGatewayProps extends cdk.StackProps {
    baseUrl: string,
    userpoolId: string
    hostedZoneId:string
}


export class DCSAAPIGateway extends cdk.Stack {
    constructor(scope: Construct, id: string, props: DCSAAPIGatewayProps) {
        super(scope, id)

        //Certificate

        var domainname = "dev1." + props.baseUrl;

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

        const existingUserPool = cognito.UserPool.fromUserPoolId(
            this,
            "upool",
            props.userpoolId
        );



        /*const authorizer = new CognitoUserPoolsAuthorizer(
            this,
            "user-pool-authorizer",
            {
                cognitoUserPools: [existingUserPool],
            }
        );*/



        const api = new apigateway.RestApi(this, "secured-api", {
            restApiName: "Secured APIGateway",
            description: "This API is the secure apis",

            domainName: {
                domainName: domainname,
                certificate: certificate,
                endpointType: EndpointType.REGIONAL,
            },
        });

        const rootResource = api.root.addProxy({
            anyMethod: true,
            defaultIntegration:new apigateway.HttpIntegration('http://amazon.com'),
        })





    



    }
}