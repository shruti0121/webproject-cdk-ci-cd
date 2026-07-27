import { DynamoDBClient, PutItemCommand , QueryCommand , BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

import crypto from "crypto";

const client = new DynamoDBClient({
    region:window.APP_CONFIG.region
});

const snsClient = new SNSClient({
    region: window.APP_CONFIG.region
  });

export const handler = async (event) => {
    console.log(event);

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    };

    try {

        const body = JSON.parse(event.body);
        
        console.log(body);
        const userid = event. queryStringParameters.user_id;
        const orderid = crypto.randomUUID();
        const products = body.products;
        console.log(products);
  
        const orderplaceddate = body.dateplaced;
        const ordertotal = body.totalcost;
        const status = body.status || "Pending";

        const params = {

            TableName: "Ricemill_orders_cdk",

            Item: {

                user_id: {
                    S: userid
                },

                order_id: {
                    S: orderid
                },

                totalcost: {
                    N: ordertotal.toString()
                },

                orderplaceddate: {
                    S: orderplaceddate
                },

                status: {
                    S: status
                },

                products: {
                    L: products.map(product => ({
                        M: {
                            productid: {
                                S: product.product_id
                            },
                            quantity: {
                                N: product.quantity.toString()
                            },
                            shippingcost:{
                              N: product.shipping_cost.toString()
                            },
                            
                            deliverydate:{
                              S: product.delivery_date
                            },
                        }
                    }))
                }

            }
        };

        await client.send(
            new PutItemCommand(params)
        );

        console.log("sending to sns");


        const message = {
            orderid,
            userid,
            products,
            ordertotal,
            status: "PLACED",
            orderplaceddate
          };
          
          console.log("SNS Message:");
          console.log(message);
          
          console.log("SNS Message (JSON):");
          console.log(JSON.stringify(message));
        await snsClient.send(
            new PublishCommand({
              TopicArn: process.env.SNS_TOPIC_ARN,
              Subject: "Order Placed",
              Message: JSON.stringify(message)
            })
          );

          console.log("finished sending to sns");

          const cartItems = await client.send(
            new QueryCommand({
                TableName: "Ricemill_carts_cdk",
                KeyConditionExpression: "user_id = :userid",
                ExpressionAttributeValues:{
                    ":userid":{
                        S: userid
                    }
                }
            })
        );


        const deleteRequests = cartItems.Items.map(item => ({
            DeleteRequest:{
                Key:{
                    user_id:{
                        S:item.user_id.S
                    },
                    product_id:{
                        S:item.product_id.S
                    }
                }
            }
        }));


        await client.send(
            new BatchWriteItemCommand({
                RequestItems:{
                    "Ricemill_carts_cdk": deleteRequests
                }
            })
        );

            



        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({
                message: "Order created",
                orderid: orderid
            })
        };

    } catch (error) {

        console.error(error);

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: error.message
            })
        };
    }
};

