import {Construct,Duration,RemovalPolicy,CfnOutput} from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds'
import * as secret from '@aws-cdk/aws-secretsmanager';


export interface DBConstructProps {
    placeholder: string
}


export class DBConstruct extends Construct {

    dbHostname: string
    dbPort:number

    constructor(scope: Construct, id: string, props: DBConstructProps) {
        super(scope, id)


        const vpc = new ec2.Vpc(this, 'my-cdk-vpc', {
            cidr: '10.0.0.0/16',
            natGateways: 0,
            maxAzs: 3,
            subnetConfiguration: [
                {
                    name: 'public-subnet-1',
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: 'isolated-subnet-1',
                    subnetType: ec2.SubnetType.ISOLATED,
                    cidrMask: 28,
                }
            ],
        });

        const dbSecret = secret.Secret.fromSecretNameV2(this,"dbsecret","DBPassword")

        const dbInstance = new rds.DatabaseInstance(this, 'db-instance', {
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.ISOLATED,
            },
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_13_1,
            }),
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.BURSTABLE3,
                ec2.InstanceSize.MICRO,
            ),
            credentials: rds.Credentials.fromSecret(dbSecret,"postgres"),
            multiAz: false,
            allocatedStorage: 100,
            maxAllocatedStorage: 105,
            allowMajorVersionUpgrade: false,
            autoMinorVersionUpgrade: true,
            backupRetention: Duration.days(0),
            deleteAutomatedBackups: true,
            removalPolicy: RemovalPolicy.DESTROY,
            deletionProtection: false,
            databaseName: 'todosdb',
            publiclyAccessible: false,
        });

        dbInstance.connections.allowFrom( ec2.Peer.anyIpv4(), ec2.Port.tcp(5432));

        this.dbPort=dbInstance.instanceEndpoint.port
        this.dbHostname=dbInstance.instanceEndpoint.hostname



        new CfnOutput(this, 'dbEndpointHostname', {
            value: dbInstance.instanceEndpoint.hostname,
        });

        new CfnOutput(this, 'dbEndpointPort', {
            value: dbInstance.instanceEndpoint.port.toString(),
        });

        new CfnOutput(this, 'secretName', {
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            value: dbInstance.secret?.secretName!,
        });



    }
}
