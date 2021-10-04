import { Construct } from '@aws-cdk/core'
import * as route53 from '@aws-cdk/aws-route53'
import * as acm from '@aws-cdk/aws-certificatemanager'

export interface DCSARoute53Props { hostedZoneId: string, baseUrl: string, participants: string}

export class DCSARoute53 extends Construct {
  hostedZone: route53.IHostedZone
  hostedZoneCertificate: acm.ICertificate


  constructor (scope: Construct, id: string, props: DCSARoute53Props = { "hostedZoneId": "", baseUrl: "", "participants": ""}) {
    super(scope, id)

    let subjectAlternativeNames: string[] = [];

    let jsonStr = props.participants;
    let jsonObj = JSON.parse(jsonStr);
    let participantsMap = new Map<string, string>(Object.entries(jsonObj));
    let firstParticipant = "";
    let i = 0;
    participantsMap.forEach((value: string, key: string) => {
      if (i === 0 ) {
        firstParticipant= key;
      }
      else {
      subjectAlternativeNames.push(key + "." + props.baseUrl);
      }
      i++;
    });

    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'dcsaHostedZone',
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.baseUrl
      }
    )

      // @ts-ignore
      this.hostedZoneCertificate = new acm.Certificate(
      this,
      'dcsaCertificate',
      {
        domainName: firstParticipant +"." + props.baseUrl,
          subjectAlternativeNames: subjectAlternativeNames,
        validation: acm.CertificateValidation.fromDns(this.hostedZone)
      }
    )
  }
}
