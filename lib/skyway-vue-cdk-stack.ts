import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';

dotenv.config();

export class SkywayVueCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // レイヤーの作成
    const layerVersionName = 'jsonwebtoken';
    const layer = new lambda.LayerVersion(this, layerVersionName, {
      layerVersionName,
      code: lambda.Code.fromAsset('lambda_layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    });

    // Lambda 関数の作成
    const functionName = 'publishTokenFunction';
    const lambdaFunction = new lambda.Function(this, functionName, {
      functionName,
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
    const restApiName = 'publishTokenApi';
    const restApi = new apigateway.RestApi(this, restApiName, {
      restApiName,
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      deploy: true,
      defaultCorsPreflightOptions: {
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });

    // ユーザープールの作成
    const userPoolName = 'skyWayUserPool';
    const cognitoUserPool = new cognito.UserPool(this, userPoolName, {
      userPoolName,
      accountRecovery: cognito.AccountRecovery.NONE,
      email: cognito.UserPoolEmail.withCognito(),
      signInCaseSensitive: false,
      autoVerify: { email: true },
    });

    // ユーザープールクライアントの追加
    const userPoolClientName = 'skyWayUserClient';
    const cognitoUserPoolClient = cognitoUserPool.addClient(
      userPoolClientName,
      { userPoolClientName }
    );

    // Authorizer の作成
    const authorizerName = 'cognitoAuthorizer';
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      authorizerName,
      {
        authorizerName,
        cognitoUserPools: [cognitoUserPool],
        identitySource: apigateway.IdentitySource.header('Authorization'),
      }
    );

    // レスポンスの作成
    const methodResponse: apigateway.MethodResponse = {
      statusCode: '200',
      responseModels: {
        'application/json': apigateway.Model.EMPTY_MODEL,
      },
      responseParameters: {
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    };
    const integrationResponse: apigateway.IntegrationResponse = {
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Origin': "'*'",
      },
    };

    // GET メソッドの追加
    restApi.root.addMethod(
      'GET',
      new apigateway.LambdaIntegration(lambdaFunction, {
        proxy: false,
        integrationResponses: [integrationResponse],
      }),
      {
        authorizer: authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
        methodResponses: [methodResponse],
      }
    );
  }
}
