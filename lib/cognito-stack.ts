import * as cdk from '@aws-cdk/core'
import { CfnOutput } from '@aws-cdk/core';
import { CognitoConstruct } from './constructs/cognito.construct';

export interface CognitoStackProps extends cdk.StackProps {
    existingUserPoolId?: string
    existingTokenUrl?: string,
    existingDcsaClientId?: string,
    existingDcsaClientSecret?: string,
    existingUiClientId?: string,
    participants: string
}

/**
 * Note this stack should never be re-run.
 */
export class CognitoStack extends cdk.Stack {
    public readonly userPoolId: string
    public readonly tokenUrl: string
    public readonly dcsaClientId: string // only for participant dcsa
    public readonly dcsaClientSecret: string // only for participant dcsa
    public readonly uiClientId: string

    constructor (scope: cdk.Construct, id: string, props: CognitoStackProps) {
        super(scope, id, props)

        const cognitoConstruct = new CognitoConstruct(this, "cg", {
            participants: props.participants,
            cognitoUserPoolId: props.existingUserPoolId ?? '',
            tokenUrl: props.existingTokenUrl ?? '',
            dcsaClientId: props.existingDcsaClientId ?? '',
            dcsaClientSecret: props.existingDcsaClientSecret ?? '',
            uiClientId: props.existingUiClientId ?? ''
        });

        this.userPoolId = cognitoConstruct.cognitoUserPoolId
        this.tokenUrl = cognitoConstruct.tokenUrl
        this.dcsaClientId = cognitoConstruct.dcsaClientId
        this.dcsaClientSecret = cognitoConstruct.dcsaClientSecret ?? ''
        this.uiClientId = cognitoConstruct.uiClientId

        new CfnOutput(this, 'userPoolId', {
            value: this.userPoolId
        });
        new CfnOutput(this, 'tokenUrl', {
            value: this.tokenUrl
        });
        new CfnOutput(this, 'dcsaClientId', {
          value: this.dcsaClientId ?? ''
        });
        new CfnOutput(this, 'dcsaClientSecret', {
            value: this.dcsaClientSecret
        });
        new CfnOutput(this, 'uiClientId', {
            value: this.uiClientId
        });
      }
}
