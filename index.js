const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
  res.send('Coffee Server is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fikwith.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection =client.db('coffeeDB').collection('coffee');

    const userCollection = client.db('coffeeDB').collection('user');


    // send data to the client side
    app.get('/coffee', async(req, res)=>{
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    // send a data in the client side
    app.get('/coffee/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await coffeeCollection.findOne(query);
      res.send(result)
    })


    // receive data from client
    app.post('/coffee', async(req, res)=>{
      const newCoffee = req.body;
      console.log(newCoffee);
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result)
    })


    // updated a data
    app.put('/coffee/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const options ={upsert: true};
        const updatedCoffee = req.body;
        const coffee ={
          $set:{
            name:updatedCoffee.name,
            photo:updatedCoffee.photo, 
            category:updatedCoffee.category,
             quantity:updatedCoffee.quantity, 
             supplier:updatedCoffee.supplier,
            test:updatedCoffee.test,
            details:updatedCoffee.details, 
          }
        }

        const result = await coffeeCollection.updateOne(filter, coffee, options);
        res.send(result)
    })


    // delete data from db
    app.delete('/coffee/:id', async(req, res)=>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)};
      const result = await coffeeCollection.deleteOne(query);
      res.send(result)
    })



    // user related api

     // get all user
     app.get('/user', async(req, res)=>{
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users)

    })

    // Receive a single data
    app.post('/user', async(req, res)=>{
      const user = req.body;
      console.log(user);
       const result = await userCollection.insertOne(user);
       res.send(result)
    })

    // delete operation api
    app.delete('/user/:id', async(req, res)=>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })

   




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`)
})