import { Construct } from '@aws-cdk/core'
import * as eks from '@aws-cdk/aws-eks'
import * as iam from '@aws-cdk/aws-iam'
import * as acm from '@aws-cdk/aws-certificatemanager'
import policyStatementActions from '../constants/policyStatementActions.constant'

export interface DCSAEKSClusterProps {  hostedZoneCertificate: acm.ICertificate} //, cognitoUserPoolId: string }


export class DCSAEKSCluster extends Construct {
  constructor (scope: Construct, id: string, props: DCSAEKSClusterProps ) {
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

    cluster.addHelmChart('EVE', {
      chart: 'dcsasandboxhamburg',
      repository: 'https://dcsaorg.github.io/Kubernetes-Packaging/',
      version: "0.1.38",
      namespace: 'default',
      values: {
        certificateArn: props.hostedZoneCertificate.certificateArn,
        envType: {
          aws: true
        },
		env: {
		  baseurl: process.env.BASEURL,
		  participant: 'evergreen-marine'
        },
		p6config: {
          company: "evergreen-marine",
          publisherRole: "CA",
          cognitoUserPoolId: process.env.COGNITOUSERPOOLID,
          cognitoAppClientId: process.env.COGNITOAPPCLIENTID,
          publisherCodeType: "SMDG_LINER_CODE",
          partyName: "Carrier"
        }
      }
    })
    cluster.addHelmChart('CMA', {
      chart: 'dcsasandboxhamburg',
      repository: 'https://dcsaorg.github.io/Kubernetes-Packaging/',
      version: "0.1.38",
      namespace: 'default',
      values: {
        certificateArn: props.hostedZoneCertificate.certificateArn,
        envType: {
          aws: true
        },
        env: {
          baseurl: process.env.BASEURL,
          participant: 'cma-cgm'
        },
        p6config: {
          company: "cma-cgm",
          publisherRole: "CA",
          cognitoUserPoolId: process.env.COGNITOUSERPOOLID,
          cognitoAppClientId: process.env.COGNITOAPPCLIENTID,
          publisherCodeType: "SMDG_LINER_CODE",
          partyName: "cma-cgm"
        }
      }
    }	
	)
    cluster.addHelmChart('HAP', {
          chart: 'dcsasandboxhamburg',
          repository: 'https://dcsaorg.github.io/Kubernetes-Packaging/',
          version: "0.1.38",
          namespace: 'default',
          values: {
            certificateArn: props.hostedZoneCertificate.certificateArn,
            envType: {
              aws: true
            },
            env: {
              baseurl: process.env.BASEURL,
              participant: 'hapag-lloyd'
            },
            p6config: {
              company: "hapag-lloyd",
              publisherRole: "CA",
              cognitoUserPoolId: process.env.COGNITOUSERPOOLID,
              cognitoAppClientId: process.env.COGNITOAPPCLIENTID,
              publisherCodeType: "SMDG_LINER_CODE",
              partyName: "hapag-lloyd"
            }
          }
        }
    )
    cluster.addHelmChart('DCS', {
          chart: 'dcsasandboxhamburg',
          repository: 'https://dcsaorg.github.io/Kubernetes-Packaging/',
          version: "0.1.38",
          namespace: 'default',
          values: {
            certificateArn: props.hostedZoneCertificate.certificateArn,
            envType: {
              aws: true
            },
            env: {
              baseurl: process.env.BASEURL,
              participant: 'dcsa'
            },
            p6config: {
              company: "dcsa",
              publisherRole: "CA",
              cognitoUserPoolId: process.env.COGNITOUSERPOOLID,
              cognitoAppClientId: process.env.COGNITOAPPCLIENTID,
              publisherCodeType: "SMDG_LINER_CODE",
              partyName: "dcsa"
            }
          }
        }
    )
    cluster.addHelmChart('HPA', {
          chart: 'dcsasandboxhamburg',
          repository: 'https://dcsaorg.github.io/Kubernetes-Packaging/',
          version: "0.1.38",
          namespace: 'default',
          values: {
            certificateArn: props.hostedZoneCertificate.certificateArn,
            envType: {
              aws: true
            },
            env: {
              baseurl: process.env.BASEURL,
              participant: 'hamburg-port-authority'
            },
            p6config: {
              company: "hamburg-port-authority",
              publisherRole: "ATH",
              cognitoUserPoolId: process.env.COGNITOUSERPOOLID,
              cognitoAppClientId: process.env.COGNITOAPPCLIENTID,
              publisherCodeType: "SMDG_LINER_CODE",
              partyName: "hamburg-port-authority"
            }
          }
        }
    )
    cluster.addHelmChart('HVC', {
          chart: 'dcsasandboxhamburg',
          repository: 'https://dcsaorg.github.io/Kubernetes-Packaging/',
          version: "0.1.38",
          namespace: 'default',
          values: {
            certificateArn: props.hostedZoneCertificate.certificateArn,
            envType: {
              aws: true
            },
            env: {
              baseurl: process.env.BASEURL,
              participant: 'hvcc-hamburg'
            },
            p6config: {
              company: "hvcc-hamburg",
              publisherRole: "TR",
              cognitoUserPoolId: process.env.COGNITOUSERPOOLID,
              cognitoAppClientId: process.env.COGNITOAPPCLIENTID,
              publisherCodeType: "SMDG_LINER_CODE",
              partyName: "hvcc-hamburg"
            }
          }
        }
    )
  }
}
