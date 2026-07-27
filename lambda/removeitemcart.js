
import { DynamoDBClient,DeleteItemCommand} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
    region:window.APP_CONFIG.region
});

export const handler = async (event) => {
  console.log(event)
  const body = JSON.parse(event.body)
  const userid = body.sub;
  const productid = body.product_id;


    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    };
  

    try {
       const result =  await client.send(
        new DeleteItemCommand
            ({
                TableName: "Ricemill_carts_cdk",
                Key: {
                    user_id: { S: userid },
                    product_id: { S: productid }
                }
            })  

       )
       console.log(result)


        return {

            statusCode: 201,

            headers: corsHeaders,
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