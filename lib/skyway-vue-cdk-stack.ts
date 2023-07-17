import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import * as lambda from 'aws-cdk-lib/aws-lambda';

dotenv.config();

export class SkywayVueCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const layer = new lambda.LayerVersion(this, 'jsonwebtoken', {
      code: lambda.Code.fromAsset('lambda_layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    });

    const fn = new lambda.Function(this, 'publish-skyway-auth-token', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: '',
      timeout: cdk.Duration.seconds(30),
      code: lambda.Code.fromAsset('lambda'),
      layers: [layer],
      environment: {
        SKYWAY_APP_ID: process.env.SKYWAY_APP_ID ?? '',
        SKYWAY_SECRET_KEY: process.env.SKYWAY_SECRET_KEY ?? '',
      },
    });
  }
}
