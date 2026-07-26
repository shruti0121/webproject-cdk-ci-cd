import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
    region: "us-east-2"
});

export const handler = async (event) => {
  console.log(event);

    const productid = event.pathParameters.productid;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "OPTIONS,POST"
  };


    try {

        const result = await client.send(
            new GetItemCommand({
                TableName: "Ricemill_products_cdk",
                Key: {
                    prod_id: {
                        S: productid 
                    }
                }
            })
        );

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(result.Item)
        };

    } catch(error) {

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: error.message
            })
        };
    }
};