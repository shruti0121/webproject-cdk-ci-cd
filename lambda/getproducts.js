import { DynamoDBClient, GetItemCommand , ScanCommand} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
    region:window.APP_CONFIG.region
});

export const handler = async (event) => {


    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    };
  

    try {
       const result =  await client.send(
            new ScanCommand
            ({
                TableName: "Ricemill_products_cdk"
            })
            
        ); //returned result will be JSON object so we need to stringify it 


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