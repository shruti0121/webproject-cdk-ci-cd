

import { DynamoDBClient,QueryCommand} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
    region:window.APP_CONFIG.region
});
export const handler = async (event) => {
  console.log(event)
  const body = JSON.parse(event.body)
  const userid = event. queryStringParameters.user_id;
  


    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    };
  

    try {
       const result =  await client.send(
        new QueryCommand
            ({
                TableName: "Ricemill_orders_cdk",
                KeyConditionExpression: "user_id = :userid",
                ExpressionAttributeValues: {
                    ":userid": { S: userid }
                }

            })

       )

    


        return {

            statusCode: 201,

            headers: corsHeaders,

            body: JSON.stringify(result.Items)
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