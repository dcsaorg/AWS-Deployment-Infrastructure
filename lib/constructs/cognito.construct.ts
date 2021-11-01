import {Construct,Duration,RemovalPolicy,CfnOutput} from '@aws-cdk/core'
import * as cognito from '@aws-cdk/aws-cognito'
import { OAuthScope } from "@aws-cdk/aws-cognito";

export interface CognitoConstructProps {
    placeholder: string
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

        


        pool.addResourceServer('upre',{
            identifier: "https://resource-server/",
            scopes: [
                {
                    scopeDescription: "todo1description",
                    scopeName: "todo1name",
                },
            ],
            userPoolResourceServerName:"ourresource"
        })

        const client = pool.addClient('client1', {
            generateSecret:true,
            oAuth: {
                flows: {
                    clientCredentials: true,
                },
                scopes: [OAuthScope.custom("https://resource-server//todo1name")],
            }});
        const clientId = client.userPoolClientId;

    }
}
