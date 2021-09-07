import { Construct } from '@aws-cdk/core'
import * as route53 from '@aws-cdk/aws-route53'
import * as acm from '@aws-cdk/aws-certificatemanager'

export interface DCSARoute53Props {}

export class DCSARoute53 extends Construct {
  hostedZone: route53.IHostedZone
  hostedZoneCertificate: acm.ICertificate

  constructor (scope: Construct, id: string, props: DCSARoute53Props = {}) {
    super(scope, id)

    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'dcsaHostedZone',
      {
        hostedZoneId: 'Z03079632C8D5IGT89TPK',
        zoneName: 'hamburg.dev.dcsa.org'
      }
    )

    this.hostedZoneCertificate = new acm.Certificate(
      this,
      'dcsaCertificate',
      {
        domainName: 'ovs.hamburg.dev.dcsa.org',
          subjectAlternativeNames: ['ovs-notification.hamburg.dev.dcsa.org', 'ui-support.hamburg.dev.dcsa.org'],		  
        validation: acm.CertificateValidation.fromDns(this.hostedZone)
      }
    )
  }
}
