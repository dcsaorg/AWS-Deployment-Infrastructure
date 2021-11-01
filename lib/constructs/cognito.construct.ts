import {Construct,Duration,RemovalPolicy,CfnOutput} from '@aws-cdk/core'
import * as cognito from '@aws-cdk/aws-cognito'
import * as rds from '@aws-cdk/aws-rds'

export interface CognitoConstructProps {
    placeholder: string
}


export class CognitoConstruct extends Construct {
    constructor(scope: Construct, id: string, props: CognitoConstructProps) {
        super(scope, id)

        new cognito.UserPool(this, 'up', {
            userPoolName: 'up',
        });

    }
}
