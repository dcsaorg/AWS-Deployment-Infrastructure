import {Construct,Duration,RemovalPolicy,CfnOutput} from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds'

export interface DBConstructProps {
    placeholder: string
}


export class DBConstruct extends Construct {
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
                }
            ],
        });

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
            credentials: rds.Credentials.fromGeneratedSecret('postgres'),
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

        new CfnOutput(this, 'dbEndpoint', {
            value: dbInstance.instanceEndpoint.hostname,
        });

        new CfnOutput(this, 'secretName', {
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            value: dbInstance.secret?.secretName!,
        });



    }
}
