import {Construct,Duration,RemovalPolicy,CfnOutput} from '@aws-cdk/core'
import * as cognito from '@aws-cdk/aws-cognito'
import {CfnUserPoolGroup, OAuthScope, UserPool, UserPoolClient} from "@aws-cdk/aws-cognito";
import * as cr from "@aws-cdk/custom-resources";

export interface CognitoConstructProps {
    participants: string,
    cognitoUserPoolId: string,
    dcsaClientId: string,
    dcsaClientSecret:string,
    tokenUrl:string,
    uiClientId:string
}


export class CognitoConstruct extends Construct {
    cognitoUserPoolId: string
    dcsaClientId: string
    dcsaClientSecret:string
    tokenUrl:string
    uiClientId:string


    constructor(scope: Construct, id: string, props: CognitoConstructProps) {
        super(scope, id);

        if(props.cognitoUserPoolId.length>0) {
            this.cognitoUserPoolId= props.cognitoUserPoolId;
            this.dcsaClientId= props.dcsaClientId;
            this.dcsaClientSecret= props.dcsaClientSecret;
            this.tokenUrl= props.tokenUrl;
            this.uiClientId= props.uiClientId;
            //this.uiClientSecret= props.uiClientSecret;
            return
        }


        const pool=new cognito.UserPool(this, 'up', {
            selfSignUpEnabled: false,
            userPoolName: 'up',
            customAttributes: {
                groups: new cognito.StringAttribute({ minLen: 1, maxLen: 255 }),
            },
        });
        pool.applyRemovalPolicy(RemovalPolicy.RETAIN);

        const urlid=pool.userPoolId.replace("eu-west-1_", "dcsa-");

        pool.addDomain('dg', {
            cognitoDomain: {
                domainPrefix: urlid,
            },
        });

        this.cognitoUserPoolId=pool.userPoolId

        this.tokenUrl="https://"+urlid+".auth.eu-west-1.amazoncognito.com/oauth2/token"


        let jsonStr = props.participants;
        let jsonObj = JSON.parse(jsonStr);

        let scopes=new Array();

        Object.values(jsonObj).forEach((participant :any) => {
            scopes.push(
                {
                    scopeDescription: participant["name"],
                    scopeName: participant["name"],
                }
            )
        });

        console.log("Scopes = " + scopes)

        const resourceServer=pool.addResourceServer('upre',{
            identifier: "clients",
            scopes:scopes,
            userPoolResourceServerName:"ourresource"
        })
        resourceServer.applyRemovalPolicy(RemovalPolicy.RETAIN);

        console.log(jsonObj)

        Object.values(jsonObj).forEach((participant :any) => {
            let customScope="clients/" + participant["name"];
            console.log('['+customScope+']')
            let client=pool.addClient('cl' + participant["name"], {
                generateSecret: true,
                oAuth: {
                    flows: {
                        clientCredentials: true,
                    },
                    scopes: [OAuthScope.custom(customScope)],
                }
            })
            client.node.addDependency(resourceServer)
            client.applyRemovalPolicy(RemovalPolicy.RETAIN);

            if(participant["name"]==='dcsa') {
                this.dcsaClientId=client.userPoolClientId
                this.dcsaClientSecret=getClientSecret("dcsa",this,pool,client)
            }
            new CfnUserPoolGroup(scope, participant["name"], {
                groupName: participant["name"],
                userPoolId: pool.userPoolId
            });

        });

        const uiClient=pool.addClient('clui', {
            generateSecret: false,
            oAuth: {
                flows: {
                    implicitCodeGrant: true,
                },
                scopes: [ cognito.OAuthScope.OPENID ],
                callbackUrls: [
                    'https://localhost'
                ],
                logoutUrls:['https://localhost']
            }
        });
        uiClient.applyRemovalPolicy(RemovalPolicy.RETAIN);

        this.uiClientId=uiClient.userPoolClientId
        //this.uiClientSecret=getClientSecret("ui",this,pool,uiClient)

    }
}

function getClientSecret(suffix:string,scope:Construct,userPool:UserPool, userPoolClient:UserPoolClient):string {
    const describeCognitoUserPoolClient = new cr.AwsCustomResource(
        scope,
        'DescribeCognitoUserPoolClient'+suffix,
        {
            resourceType: 'Custom::DescribeCognitoUserPoolClient',
            onCreate: {
                region: 'eu-west-1',
                service: 'CognitoIdentityServiceProvider',
                action: 'describeUserPoolClient',
                parameters: {
                    UserPoolId: userPool.userPoolId,
                    ClientId: userPoolClient.userPoolClientId,
                },
                physicalResourceId: cr.PhysicalResourceId.of(userPoolClient.userPoolClientId),
            },
            // TODO: can we restrict this policy more?
            policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
        }
    )
    describeCognitoUserPoolClient.node.addDependency(userPoolClient);
    describeCognitoUserPoolClient.node.addDependency(userPool);
    return describeCognitoUserPoolClient.getResponseField(
        'UserPoolClient.ClientSecret'
    )
}
