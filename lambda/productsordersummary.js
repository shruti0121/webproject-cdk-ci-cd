import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";


const client = new DynamoDBClient({
    region: "us-east-2"
});

export const handler = async (event) => {
    console.log(event)


    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    };
  

    try {

        const body = JSON.parse(event.body);

        const productid = body.productid.S;
        console.log(productid)


        const result = await client.send(
            new GetItemCommand
                ({
                    TableName: "Ricemill_products_cdk",
                    Key: {
                        prod_id: { S: productid }
                    }
                })
        );
        console.log(result)


        return {

            statusCode: 201,

            headers: corsHeaders,
            body: JSON.stringify( result.Item)

            
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