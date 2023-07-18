import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

dotenv.config();

export class SkywayVueCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // レイヤーの作成
    const layer = new lambda.LayerVersion(this, 'jsonwebtoken', {
      layerVersionName: 'jsonwebtoken',
      code: lambda.Code.fromAsset('lambda_layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    });

    // Lambda 関数の作成
    const lambdaFunction = new lambda.Function(this, 'publishTokenFunction', {
      functionName: 'publishToken',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      code: lambda.Code.fromAsset('lambda'),
      handler: 'index.handler',
      layers: [layer],
      environment: {
        SKYWAY_APP_ID: process.env.SKYWAY_APP_ID ?? '',
        SKYWAY_SECRET_KEY: process.env.SKYWAY_SECRET_KEY ?? '',
      },
    });

    // REST API の作成
    const restApi = new apigateway.RestApi(this, 'publishTokenApi', {
      restApiName: 'publishToken',
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      deploy: true,
      defaultCorsPreflightOptions: {
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });

    // レスポンスの作成
    const methodResponse: apigateway.MethodResponse = {
      statusCode: '200',
      responseModels: {
        'application/json': apigateway.Model.EMPTY_MODEL,
      },
    };
    const integrationResponse: apigateway.IntegrationResponse = {
      statusCode: '200',
    };

    // GET メソッドの追加
    restApi.root.addMethod(
      'GET',
      new apigateway.LambdaIntegration(lambdaFunction, {
        proxy: false,
        integrationResponses: [integrationResponse],
      }),
      {
        methodResponses: [methodResponse],
      }
    );
  }
}
