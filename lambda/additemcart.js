//Edits an existing item's attributes, or adds a new item to the table if it does not already exist.
 //You can put, delete, or add attribute values. You can also perform a conditional update 
 //on an existing item (insert a new attribute name-value pair if it doesn't exist, 
//or replace an existing name-value pair if it has certain expected attribute values).
//You can also return the item's attribute values in the same UpdateItem operation using the 
//ReturnValues parameter.


import { DynamoDBClient, GetItemCommand ,UpdateItemCommand} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
    region: "us-east-2"

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
        new UpdateItemCommand({
          TableName: "Ricemill_carts_cdk",
          Key: {
              user_id: { S: userid },
              product_id: { S: productid }
          },
          UpdateExpression:
          "SET quantity = if_not_exists(quantity, :zero) + :increment",
          
          ExpressionAttributeValues:{
            ":zero":{
                N:"0"
            },
            ":increment":{
                N:"1"
            }
        },
        
        ReturnValues:"ALL_NEW"
      })

       )
       console.log(result)


        return {

            statusCode: 201,

            headers: corsHeaders,

            body: JSON.stringify(result.Attributes)
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