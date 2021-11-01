import {Construct,Duration,RemovalPolicy,CfnOutput} from '@aws-cdk/core'
import * as cognito from '@aws-cdk/aws-cognito'
import {CfnUserPoolGroup, OAuthScope} from "@aws-cdk/aws-cognito";

export interface CognitoConstructProps {
    participants: string,
}


export class CognitoConstruct extends Construct {
    constructor(scope: Construct, id: string, props: CognitoConstructProps) {
        super(scope, id);

        const pool=new cognito.UserPool(this, 'up', {
            userPoolName: 'up',
        });

        pool.addDomain('dg', {
            cognitoDomain: {
                domainPrefix: 'weneedsomerandomhere',
            },
        });


        pool.addClient('clui', {
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

        pool.addResourceServer('upre',{
            identifier: "dcsa",
            scopes:scopes,
            userPoolResourceServerName:"ourresource"
        })


        console.log(participantsMap)

        participantsMap.forEach((value: string, key: string) => {
            const customScope=`dcsa/${key}`
            console.log(customScope)
            const client = pool.addClient('cl' + key, {
                generateSecret: true,
                oAuth: {
                    flows: {
                        clientCredentials: true,
                    },
                    scopes: [OAuthScope.custom(customScope)],
                }
            });
            const clientId = client.userPoolClientId;

            new CfnUserPoolGroup(scope, key, {
                groupName: key,
                userPoolId: pool.userPoolId
            });

        });
    }
}
