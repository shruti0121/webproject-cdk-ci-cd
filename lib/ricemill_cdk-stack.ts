import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Duration, Stack, StackProps } from 'aws-cdk-lib/core';
import {Construct} from 'constructs'
import * as route53  from 'aws-cdk-lib/aws-route53'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdatriggers from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_sub from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ses from 'aws-cdk-lib/aws-ses';
import { aws_codeconnections as codeconnections } from 'aws-cdk-lib'


export class RicemillCdkStack extends Stack {
  constructor (scope:Construct , id:string , props?:StackProps){ //scope - parent object (where would this stack live in the cdk tree),id-name of this stack, props → configuration options for the stack (region, account, tags, etc.) , app is entire cdk project so ususally scope is app 

    super(scope, id , props);

    //now we need to declare resources
    //lets start with route53 hosted zone record with simple routing of ricemill.shruti-singla.com to cloudfornt 
    // we need ssl certificate as well 
    //Then we should create cloudfront resource with its origin to s3 bucket
    //we need to create s3 bucket with the code


    //now we need cognito user pool for authentication and authorization
    //Then we should create API gateway and then we set up lambda functions which will be attached to the rest APIs
    //We should also create iam lambda roles and resource policies for sns,sqs,lambda-with sqs
    // Now we create dynamodb tables 
    //we need sns, sqs and ses resources 


     //crate iam role for all the api connected lambdas since they all need access to cloudwatch and dynamodb 

    //  const SourceConnection = new codeconnections.CfnConnection(
    //   this,
    //   'CICD_Workshop_Connection',
    //   {
    //     connectionName: 'CICD_Workshop_Connection',
    //     providerType: 'GitHub',
    //   },
    // )


/*   --------------------- IAM Role for backend lambdas except orders ----------------------------- */
     const iamrole = new iam.Role(this, "apilambdaiam",{
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess")

      ]
     });


/*   --------------------- IAM Role for putordr lambda --------------------------------- */
//this needs access to sns topic as well 
     const iamrole_orders = new iam.Role(this, "apilambdaiam_putorder",{
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSNSFullAccess")

      ]
     });



/*   ----------- IAM Role for lambdas pooling sqs (analytics and inventory) -------------------- */

     const iamrole_sqs_lambdas = new iam.Role(this, "sqslambdaiam",{
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ), //cloudwatch logs 
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaSQSQueueExecutionRole"
        )

      ]
     });

/*   ----------- IAM Role for lambdas pooling sqs (analytics and inventory) -------------------- */

const iamrole_sqs_lambda_email = new iam.Role(this, "sqslambdaiam_email",{
  assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName(
      "service-role/AWSLambdaBasicExecutionRole",
    ), //cloudwatch logs 
    iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSESFullAccess"),
    iam.ManagedPolicy.fromAwsManagedPolicyName(
      "service-role/AWSLambdaSQSQueueExecutionRole"
    )

  ]
 });

/*   --------------------- App Start  ----------------------------- */
    const hostedzone = route53.HostedZone.fromLookup(
      this,"ExistingZone",
      {
        domainName:"shruti-singla.com"
      }
    );  //here hostedzone is ihostedzone type as route53.HostedZone.fromLookup  has return type ihostedzone
     
    const myBucket = new s3.Bucket(this, 'ricemill6727807');
    const oac = new cloudfront.S3OriginAccessControl(this, 'MyOAC', {
      signing: cloudfront.Signing.SIGV4_NO_OVERRIDE
    });
    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(myBucket, {
      originAccessControl: oac
    })
       
    //deploy the objects in the bucket 
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("./ricemill-web-app-files")],
      destinationBucket: myBucket,
    });


    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "WebsiteCertificate",
      "arn:aws:acm:us-east-1:882885365745:certificate/4ad80127-0d86-4513-b239-92e899f81d31"
    );


    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
          origin: s3Origin,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED
      },
  
      domainNames: ["us-east-2.ricemill.shruti-singla.com"],
  
      certificate: certificate,
      defaultRootObject: "index.html",
  }); //need to create cloudfront distribution currently this has type cloudfront.distribution

    new route53.ARecord(this, 'AliasRecord', {
      zone : hostedzone,  //so zone here expects type as ihostedzone 
      recordName: "us-east-2.ricemill.shruti-singla.com",
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
    )        //type should be Recordtarget 
    });


    //now we need cognito user pool for authentication 

    const userPool = new cognito.UserPool(this, "Userpool2",{
      selfSignUpEnabled : true,
      passwordPolicy : {
        minLength:6,
        requireSymbols : false,  //default for require upper and lowercase is true and atleast 1 needed 
      },
      // UserVerificationConfig this config email properties for config and we keep the m default

      signInAliases: {
        username: true,
        email: true, // Optional: lets users sign in with either username or email
      },
    
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    }
    )  //this is userpool Object 

    //once we have userPool then we need userclient named ricemill
    const poolclient = userPool.addClient("RiceMillClient", {
      userPoolClientName : "Ricemill",
    });  

    const apigate = new  apigateway.RestApi(this,"Restapi_Ricemill",{
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS
      }
    });

    const ricemill= apigate.root.addResource("ricemill"); //all other resources created under will inherit from this parent resource


    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "RicemillAuthorizer",
      {
        cognitoUserPools: [userPool]
      }
    );

    const authOptions = {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: authorizer
    };



/*   --------------------- Login API --------------------------------- */
    const login =  ricemill.addResource("login-cdk");
  
    const loginlambda = new lambda.Function(this, "loginlambda",
      {
        runtime: lambda.Runtime.NODEJS_24_X,
        handler:"login.handler",
        code : lambda.Code.fromAsset("lambda"),
        role : iamrole,

  });
    login.addMethod(
      "POST",
      new apigateway.LambdaIntegration(loginlambda),
      authOptions
    );


    const db = new dynamo.Table(this, "RicemillUserTable", {
      tableName: "Ricemill_user_cdk",
    
      partitionKey: {
        name: "user_id",
        type: dynamo.AttributeType.STRING
      },
    
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST
    });


/* --------------------- Products API --------------------------------- */
    const products =  ricemill.addResource("products-cdk");
    const productslambda = new lambda.Function(this, "getproductslambda",
      {
        runtime: lambda.Runtime.NODEJS_24_X,
        handler:"getproducts.handler",
        code : lambda.Code.fromAsset("lambda"),
        role : iamrole,

  });
    products.addMethod(
      "GET",
      new apigateway.LambdaIntegration(productslambda),
      authOptions
    );

    //diff lambda function 

    const productsordersummarylambda = new lambda.Function(this, "productsordersummarylambda",
      {
        runtime: lambda.Runtime.NODEJS_24_X,
        handler:"productsordersummary.handler",
        code : lambda.Code.fromAsset("lambda"),
        role : iamrole,

  });
    products.addMethod(
      "POST",
      new apigateway.LambdaIntegration(productsordersummarylambda),
      authOptions
    );


    const db_products = new dynamo.Table(this, "RicemilproductsTable", {
      tableName: "Ricemill_products_cdk",
    
      partitionKey: {
        name: "prod_id",
        type: dynamo.AttributeType.STRING
      },
    
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST
    });


                /* --------- Getsingleproduct API ------- */

                const getsingleproduct = products.addResource("{productid}", {
                  defaultCorsPreflightOptions: {
                    allowOrigins: apigateway.Cors.ALL_ORIGINS,
                    allowMethods: apigateway.Cors.ALL_METHODS,
                    allowHeaders: apigateway.Cors.DEFAULT_HEADERS
                  }
                });



    const getsingleproductlambda = new lambda.Function(this, "getsingleproductlambda",
      {
        runtime: lambda.Runtime.NODEJS_24_X,
        handler:"getsingleproduct.handler",
        code : lambda.Code.fromAsset("lambda"),
        role : iamrole,

    });
    getsingleproduct.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getsingleproductlambda),
      authOptions
    );



/* --------------------- GetCArtCount API --------------------------------- */

  const cartcount =  ricemill.addResource("getcartcount-cdk");
    const cartcountlambda = new lambda.Function(this, "getcartcountlambda",
      {
        runtime: lambda.Runtime.NODEJS_24_X,
        handler:"getcartcount.handler",
        code : lambda.Code.fromAsset("lambda"),
        role : iamrole,

  });
    cartcount.addMethod(
      "POST",
      new apigateway.LambdaIntegration(cartcountlambda),
      authOptions
    );

    const db_getcartcount = new dynamo.Table(this, "RicemillcartcountTable", {
      tableName: "Ricemill_carts_cdk",
    
      partitionKey: {
        name: "user_id",
        type: dynamo.AttributeType.STRING
      },
      sortKey: {
        name: "product_id",
        type: dynamo.AttributeType.STRING,
      },
    
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST
    });


/* --------------------- Additemcart API --------------------------------- */

const additemcart =  ricemill.addResource("additemcart-cdk");
    const additemcartlambda = new lambda.Function(this, "additemcartlambda",
      {
        runtime: lambda.Runtime.NODEJS_24_X,
        handler:"additemcart.handler",
        code : lambda.Code.fromAsset("lambda"),
        role : iamrole,

  });
  additemcart.addMethod(
      "POST",
      new apigateway.LambdaIntegration(additemcartlambda ),
      authOptions
    );



/* --------------------- Removeitemcart API --------------------------------- */

const removeitemcart =  ricemill.addResource("removeitemcart-cdk");
const removeitemcartlambda = new lambda.Function(this, "removeitemcartlambda",
  {
    runtime: lambda.Runtime.NODEJS_24_X,
    handler:"removeitemcart.handler",
    code : lambda.Code.fromAsset("lambda"),
    role : iamrole,

});
removeitemcart.addMethod(
  "POST",
  new apigateway.LambdaIntegration(removeitemcartlambda),
  authOptions
);

/* --------------------- PutShipping API --------------------------------- */

const putshipping =  ricemill.addResource("putshipping-cdk");
const putshippinglambda = new lambda.Function(this, "putshippinglambda",
  {
    runtime: lambda.Runtime.NODEJS_24_X,
    handler:"putshipping.handler",
    code : lambda.Code.fromAsset("lambda"),
    role : iamrole,

});
putshipping.addMethod(
  "POST",
  new apigateway.LambdaIntegration(putshippinglambda),
  authOptions
);



/* --------------------- SNSTopic --------------------------------- */
const sns_putorder = new sns.Topic(this,"SNS",{
  displayName : "ricemill_snstopic",
  topicName   : "ricemill_snstopic_orderplaced",
  fifo        : false
 });

/* --------------------- Putorder API --------------------------------- */

    const putorders =  ricemill.addResource("putorders-cdk");
    const putorderslambda = new lambda.Function(this, "putorderslambda",
      {
        runtime: lambda.Runtime.NODEJS_24_X,
        handler:"putorders.handler",
        code : lambda.Code.fromAsset("lambda"),
        role : iamrole_orders,
        environment:{
          SNS_TOPIC_ARN: sns_putorder.topicArn
        }

    });
    putorders.addMethod(
      "POST",
      new apigateway.LambdaIntegration(putorderslambda),
      authOptions
    );

    const db_putorders = new dynamo.Table(this, "RicemillputordersTable", {
      tableName: "Ricemill_orders_cdk",

      partitionKey: {
        name: "user_id",
        type: dynamo.AttributeType.STRING
      },
      sortKey: {
        name: "order_id",
        type: dynamo.AttributeType.STRING,
      },

      billingMode: dynamo.BillingMode.PAY_PER_REQUEST
    });


/* --------------------- Getorders API --------------------------------- */

    const getorders =  ricemill.addResource("getorders-cdk");
    const getorderslambda = new lambda.Function(this, "getorderslambda",
      {
        runtime: lambda.Runtime.NODEJS_24_X,
        handler:"getorders.handler",
        code : lambda.Code.fromAsset("lambda"),
        role : iamrole,

    });
    getorders.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getorderslambda),
      authOptions
    );


/* --------------------- SQS's dead letter queeus--------------------------------- */

const sqs_email_dlq = new sqs.Queue(this,"SQS-email-dlq",{
  queueName : "SQS-email-dlq",
  // redriveAllowPolicy: {
  //   redrivePermission : sqs.RedrivePermission.BY_QUEUE,
  // }
 });

 const sqs_inventory_dlq = new sqs.Queue(this,"SQS-inventory-dlq",{
  queueName : "SQS-inventory-dlq",
  // redriveAllowPolicy: {
  //   redrivePermission : sqs.RedrivePermission.BY_QUEUE
  // }
 });


 const sqs_analytics_dlq = new sqs.Queue(this,"SQS-analytics-dlq",{
  queueName : "SQS-analytics-dlq",
  // redriveAllowPolicy: {
  //   redrivePermission : sqs.RedrivePermission.BY_QUEUE
  // }
 });


/* --------------------- SQS's --------------------------------- */

 const sqs_email = new sqs.Queue(this,"SQS-email",{ //by defualt standard queue 
  queueName : "SQS-email",
  deadLetterQueue : {
    queue :sqs_email_dlq,
    maxReceiveCount: 2
  }
 });

 const sqs_inventory = new sqs.Queue(this,"SQS-inventory",{ //by defualt standard queue 
  queueName : "SQS-inventory",
  deadLetterQueue : {
    queue :sqs_inventory_dlq,
    maxReceiveCount: 2
  }
 });

 const sqs_analytics = new sqs.Queue(this,"SQS-analytics",{ //by defualt standard queue 
  queueName : "SQS-analytics",
  deadLetterQueue : {
    queue :sqs_analytics_dlq,
    maxReceiveCount: 2
  }
 });

/* --------------------- SQS's resource policy to let messages in from SNS ------------------------ */

const sqs_policy = new sqs.QueuePolicy(this , "SQS-policy",{
  queues: [sqs_email_dlq,sqs_inventory_dlq,sqs_analytics_dlq],

})

sqs_policy.document.addStatements(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    principals: [
      new iam.ServicePrincipal("sns.amazonaws.com")
    ],
    actions: [
      "sqs:SendMessage"
    ],
    resources: [
         "*"

    ],
    conditions: {
      ArnEquals: {
        "aws:SourceArn": sns_putorder.topicArn
      }
    }
  })
);

 /* --------------------- Subscription between SQS's and SNS --------------------------------- */
 sns_putorder.addSubscription(
  new sns_sub.SqsSubscription(sqs_email)
);

sns_putorder.addSubscription(
  new sns_sub.SqsSubscription(sqs_inventory)
);
sns_putorder.addSubscription(
  new sns_sub.SqsSubscription(sqs_analytics)
);

/* --------------------- SES identities for SQS-email --------------------------------- */

  const ses_identity_from  = new ses.EmailIdentity(this, "ses-Emailidentity-from",{
    identity: ses.Identity.email("shrutisingla268@gmail.com"),
  })
  const ses_identity_to  = new ses.EmailIdentity(this, "ses-Emailidentity-to",{
    identity: ses.Identity.email("ruhichawla268@gmail.com"),
  })


/* --------------------- Lambdas for SQS --------------------------------- */

const sqs_email_lambda = new lambda.Function(this, "sqsemaillambda",
  {
    runtime: lambda.Runtime.NODEJS_24_X,
    handler:"sqsemail.handler",
    code : lambda.Code.fromAsset("lambda"),
    role : iamrole_sqs_lambda_email,  //now this only need access to ses and sqs
    
}); 


const sqs_analytics_lambda = new lambda.Function(this, "sqs_analytics_lambda",
  {
    runtime: lambda.Runtime.NODEJS_24_X,
    handler:"sqsanalytics.handler",
    code : lambda.Code.fromAsset("lambda"),
    role : iamrole_sqs_lambdas,  //now this only need access to db and sqs
});



const sqs_inventory_lambda = new lambda.Function(this, "sqs_inventory_lambda",
  {
    runtime: lambda.Runtime.NODEJS_24_X,
    handler:"sqsinventory.handler",
    code : lambda.Code.fromAsset("lambda"),
    role : iamrole_sqs_lambdas,   //now this only need access to db and sqs 
    

});


/* --------------------- SQS Lambda triggers --------------------------------- */
sqs_email_lambda.addEventSource(
  new lambdatriggers.SqsEventSource(sqs_email)
);


sqs_inventory_lambda.addEventSource(
  new lambdatriggers.SqsEventSource(sqs_inventory)
);

sqs_analytics_lambda.addEventSource(
  new lambdatriggers.SqsEventSource(sqs_analytics)
);

/* --------------------- Analytics and Inventoy Databases --------------------------------- */

    const db_analytics = new dynamo.Table(this, "RicemillanalyticsTable", {
      tableName: "Ricemill_analytics_v3_cdk",

      partitionKey: {
        name: "metric_name",
        type: dynamo.AttributeType.STRING
      },
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST
    });

    const db_product_inventory = new dynamo.Table(this, "RicemillproductinventoryTable", {
      tableName: "Ricemill_product_inventory_cdk",
    
      partitionKey: {
        name: "product_id",
        type: dynamo.AttributeType.STRING
      }, 
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST
    });

  }
}

