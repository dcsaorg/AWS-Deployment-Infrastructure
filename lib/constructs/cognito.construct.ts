import {Construct,Duration,RemovalPolicy,CfnOutput} from '@aws-cdk/core'
import * as cognito from '@aws-cdk/aws-cognito'
import {CfnUserPoolGroup, OAuthScope, UserPool, UserPoolClient} from "@aws-cdk/aws-cognito";
import * as cr from "@aws-cdk/custom-resources";

export interface CognitoConstructProps {
    participants: string,
}


export class CognitoConstruct extends Construct {

    cognitoUserPoolId: string
    dcsaClientId: string
    dcsaClientSecret:string
    tokenUrl:string
    uiClientId:string
    uiClientSecret:string

    constructor(scope: Construct, id: string, props: CognitoConstructProps) {
        super(scope, id);

        const pool=new cognito.UserPool(this, 'up', {
            selfSignUpEnabled: true,
            userPoolName: 'up',
            customAttributes: {
                groups: new cognito.StringAttribute({ minLen: 1, maxLen: 255 }),
            },
        });

        const urlid=makeid(10);

        pool.addDomain('dg', {
            cognitoDomain: {
                domainPrefix: urlid,
            },
        });

        this.cognitoUserPoolId=pool.userPoolId

        this.tokenUrl="https://"+urlid+".auth.eu-west-1.amazoncognito.com/oauth2/token"


        let jsonStr = props.participants;
        let jsonObj = JSON.parse(jsonStr);
        let participantsMap = new Map<string, string>(Object.entries(jsonObj));

        let scopes=new Array();

        participantsMap.forEach((value: string, key: string) => {
            scopes.push(
                {
                    scopeDescription: key,
                    scopeName: key,
                }
            )
        });

        console.log(scopes)

        const resourceServer=pool.addResourceServer('upre',{
            identifier: "dcsa",
            scopes:scopes,
            userPoolResourceServerName:"ourresource"
        })

        console.log(participantsMap)

        participantsMap.forEach((value: string, key: string) => {
            let customScope=`dcsa/${key}`
            console.log('['+customScope+']')
            let client=pool.addClient('cl' + key, {
                generateSecret: true,
                oAuth: {
                    flows: {
                        clientCredentials: true,
                    },
                    scopes: [OAuthScope.custom(customScope)],
                }
            })
            client.node.addDependency(resourceServer)

            if(key==='dcsa') {
                this.dcsaClientId=client.userPoolClientId
                this.dcsaClientSecret=getClientSecret("dcsa",this,pool,client)
            }
            new CfnUserPoolGroup(scope, key, {
                groupName: key,
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

        this.uiClientId=uiClient.userPoolClientId
        this.uiClientSecret=getClientSecret("ui",this,pool,uiClient)

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
