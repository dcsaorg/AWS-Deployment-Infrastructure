import { Construct } from '@aws-cdk/core'
import * as route53 from '@aws-cdk/aws-route53'
import * as acm from '@aws-cdk/aws-certificatemanager'

export interface DCSARoute53Props { hostedZoneId: string, baseUrl: string, participants: string[]}

export class DCSARoute53 extends Construct {
  hostedZone: route53.IHostedZone
  hostedZoneCertificate: acm.ICertificate


  constructor (scope: Construct, id: string, props: DCSARoute53Props = { "hostedZoneId": "", baseUrl: "", "participants": []}) {
    super(scope, id)
    let subjectAlternativeNamesString = '';

    props.participants.forEach( ((participant, i, arr) => {
        if (i === 0) return;
        subjectAlternativeNamesString += participant + "." + props.baseUrl;
        if (i < arr.length -1) {
            subjectAlternativeNamesString+= ","
        }
    }));

    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'dcsaHostedZone',
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.baseUrl
      }
    )

    this.hostedZoneCertificate = new acm.Certificate(
      this,
      'dcsaCertificate',
      {
        domainName: props.participants[0] + props.baseUrl,
          subjectAlternativeNames: subjectAlternativeNamesString,
        validation: acm.CertificateValidation.fromDns(this.hostedZone)
      }
    )
  }
}
