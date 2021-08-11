import * as cdk from '@aws-cdk/core';

import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import {readFileSync} from 'fs';

export class SimpleEc2CdkInstanceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    //create a vpc where we'll launch the instance
    // Get the default VPC. This is the network where your instance will be provisioned
    // All activated regions in AWS have a default vpc. 
    // You can create your own of course as well. https://aws.amazon.com/vpc/
    const vpc = new ec2.Vpc(this, 'simple-ec2-cdk-instance-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 0,
      subnetConfiguration:[
        {name: 'public', cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC},
      ],
    });

    //security group for the instance 
    // A security group acts as a virtual firewall for your instance to control inbound and outbound traffic.
    const webserverSG = new ec2.SecurityGroup(this, 'webserver-sg', {
      vpc,
      allowAllOutbound: true, // will let your instance send outboud traffic
      description: 'security group for any common web server',
    });

    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'allow HTTP traffic from anywhere',
    );

    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow SSH access from anywhere',
    );

    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'allow HTTPS traffic from anywhere',
    );

    //role for the ec2 instance
    // You can attach permissions to a role and determine what your instance can or can not do
    const webserverRole = new iam.Role(this, 'webserver-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'), //As an example, we have attached a managed policy that grants S3 read access to the role.
      ],
    });

    //creating the ec2 instance
    const ec2Instance = new ec2.Instance(this, 'simple-ec2-instance', {
      vpc, 
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      role: webserverRole,
      securityGroup: webserverSG,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: 'MyTestKeyPair',
    });

     // load contents of script
     const userDataScript = readFileSync('./lib/user-data.sh', 'utf8'); //script installs and starts nginx and writes a simple "It worked" heading tag to the root of our web server.
     
     // add the User Data script to the Instance
     ec2Instance.addUserData(userDataScript);
  }
}
