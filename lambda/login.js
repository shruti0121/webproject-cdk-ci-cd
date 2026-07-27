import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";


const client = new DynamoDBClient({
    region:window.APP_CONFIG.region
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
        const sub =  body.sub ;

        const username = body.username;


        const params = {

            TableName: "Ricemill_user_cdk",

            Item: {

                user_id: {
                    S: sub
                },

                username: {
                    S: username
                }

            }
        };


        await client.send(
            new PutItemCommand(params)
        );


        return {

            statusCode: 201,

            headers: corsHeaders,

            body: JSON.stringify({
                message: "User created",
                userid: sub
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