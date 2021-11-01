import {Construct,Duration,RemovalPolicy,CfnOutput} from '@aws-cdk/core'
import * as cognito from '@aws-cdk/aws-cognito'
import { OAuthScope } from "@aws-cdk/aws-cognito";

export interface CognitoConstructProps {
    participants: string,
}


export class CognitoConstruct extends Construct {
    constructor(scope: Construct, id: string, props: CognitoConstructProps) {
        super(scope, id)

        const pool=new cognito.UserPool(this, 'up', {
            userPoolName: 'up',
        });

        pool.addDomain('dg', {
            cognitoDomain: {
                domainPrefix: 'weneedsomerandomhere',
            },
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


        pool.addResourceServer('upre',{
            identifier: "dcsa",
            scopes:scopes,
            userPoolResourceServerName:"ourresource"
        })

        /*participantsMap.forEach((value: string, key: string) => {
            const client = pool.addClient('cl' + key.substring(0, 3), {
                generateSecret: true,
                oAuth: {
                    flows: {
                        clientCredentials: true,
                    },
                    scopes: [OAuthScope.custom("dcsa/" + key)],
                }
            });
            const clientId = client.userPoolClientId;
        });*/
    }
}
