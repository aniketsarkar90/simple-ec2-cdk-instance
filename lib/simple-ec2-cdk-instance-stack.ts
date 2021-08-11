import * as cdk from '@aws-cdk/core';

import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/aws-iam';

export class SimpleEc2CdkInstanceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    //create a vpc where we'll launch the instance

    //a security group

    //role for the instance

    //ec2 
  }
}
