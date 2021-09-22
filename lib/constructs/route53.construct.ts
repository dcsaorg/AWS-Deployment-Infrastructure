import { Construct } from '@aws-cdk/core'
import * as route53 from '@aws-cdk/aws-route53'
import * as acm from '@aws-cdk/aws-certificatemanager'

export interface DCSARoute53Props { hostedZoneId: string}

export class DCSARoute53 extends Construct {
  hostedZone: route53.IHostedZone
  hostedZoneCertificate: acm.ICertificate

  constructor (scope: Construct, id: string, props: DCSARoute53Props = { "hostedZoneId": ""}) {
    super(scope, id)
      this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'dcsaHostedZone',
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: "hamburg.dev.dcsa.org"
      }
    )

    this.hostedZoneCertificate = new acm.Certificate(
      this,
      'dcsaCertificate',
      {
        domainName: "dcsa." + process.env.BASEURL,
          subjectAlternativeNames: ["evergreen-marine." + process.env.BASEURL, "hamburg-port-authority." + process.env.BASEURL, "hapag-lloyd." + process.env.BASEURL, "hvcc-hamburg." + process.env.BASEURL, "cma-cgm." + process.env.BASEURL],
        validation: acm.CertificateValidation.fromDns(this.hostedZone)
      }
    )
  }
}
