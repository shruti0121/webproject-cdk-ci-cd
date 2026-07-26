//Edits an existing item's attributes, or adds a new item to the table if it does not already exist.
 //You can put, delete, or add attribute values. You can also perform a conditional update 
 //on an existing item (insert a new attribute name-value pair if it doesn't exist, 
//or replace an existing name-value pair if it has certain expected attribute values).
//You can also return the item's attribute values in the same UpdateItem operation using the 
//ReturnValues parameter.


import { DynamoDBClient, UpdateItemCommand} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
    region: "us-east-2"
});

export const handler = async (event) => {
  console.log(event)
  const body = JSON.parse(event.body)
  console.log(body);
  const userid = body.sub;
  const productid = body.productid;
  const cost = body.cost;
  const date = body.deliverydate;


    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    };
  
    console.log("userid:", userid);
    console.log("productid:", productid);
    console.log("cost:", cost);
    console.log("date:", date);
    try {
       const result =  await client.send(
        new UpdateItemCommand({
          TableName: "Ricemill_carts_cdk",
          Key: {
              user_id: { S: userid },
              product_id: { S: productid }
          },
          UpdateExpression: "SET shipping_cost = :shippingCost, delivery_date = :deliveryDate",
          ExpressionAttributeValues: {
            ":shippingCost": { N: cost.toString() },
            ":deliveryDate": { S: date }
          },
        
        ReturnValues:"ALL_NEW"
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