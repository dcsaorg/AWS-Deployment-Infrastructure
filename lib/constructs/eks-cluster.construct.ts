import { Construct } from '@aws-cdk/core'
import * as eks from '@aws-cdk/aws-eks'
import * as iam from '@aws-cdk/aws-iam'
import * as acm from '@aws-cdk/aws-certificatemanager'
import policyStatementActions from '../constants/policyStatementActions.constant'

export interface DCSAEKSClusterProps {
  hostedZoneCertificate: acm.ICertificate
}

export class DCSAEKSCluster extends Construct {
  constructor (scope: Construct, id: string, props: DCSAEKSClusterProps) {
    super(scope, id)

    const cluster = new eks.FargateCluster(this, 'cl', {
      version: eks.KubernetesVersion.V1_18,
      clusterName: 'cl'
    })



    const policyStatement = new iam.PolicyStatement({
      resources: ['*'],
      actions: policyStatementActions
    })

    const adminStatement = new iam.PolicyStatement({
      resources: ['*'],
      actions: ['*']
    })

    const account = cluster.addServiceAccount('ALBController', {
      name: 'aws-load-balancer-controller',
      namespace: 'kube-system'
    })

    account.addToPrincipalPolicy(policyStatement)
    account.addToPrincipalPolicy(adminStatement)

    cluster.addHelmChart('ALBController', {
      chart: 'aws-load-balancer-controller',
      repository: 'https://aws.github.io/eks-charts',
      namespace: 'kube-system',
      release: 'aws-load-balancer-controller',
      values: {
        region: 'eu-west-1',
        vpcId: cluster.vpc.vpcId,
        clusterName: cluster.clusterName,
        serviceAccount: {
          create: false,
          name: account.serviceAccountName
        }
      }
    })

    cluster.addHelmChart('helm', {
      chart: 'dcsasandboxhamburg',
      repository: 'https://dcsaorg.github.io/Kubernetes-Packaging/',
      namespace: 'default',
      values: {
        certificateArn: props.hostedZoneCertificate.certificateArn,
        envType: {
          aws: true
        }
      }
    })

  }
}
