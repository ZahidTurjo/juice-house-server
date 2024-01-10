const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()

const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.whoa8gp.mongodb.net/?retryWrites=true&w=majority`;

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
    const juiceCollection = client.db('juiceDb').collection('juice')
    const usersCollection = client.db('juiceDb').collection('user')
    await client.connect();
    app.post('/juice', async (req, res) => {
      const newJuice = req.body;
      console.log(newJuice);
      const result = await juiceCollection.insertOne(newJuice)
      res.send(result)

    })

    app.get('/juice', async (req, res) => {
      const result = await juiceCollection.find().toArray()
      res.send(result)
    })
    app.get('/juice/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await juiceCollection.findOne(query)
      res.send(result)
    })

    app.put('/juice/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedJuice = req.body;

      const updatedDoc = {
        $set: {
          name: updatedJuice.name,
          quantity: updatedJuice.quantity,
          supplier: updatedJuice.supplier,
          taste: updatedJuice.taste,
          category: updatedJuice.category,
          image: updatedJuice.image,
          details: updatedJuice.details,

        }
      }
      const result = await juiceCollection.updateOne(filter, updatedDoc, options);
      res.send(result)

    })

    app.delete('/juice/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await juiceCollection.deleteOne(query)
      res.send(result)
    })
    // users
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query)
      res.send(result)
    })
    app.patch('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email }
      const updatedDoc = {
        $set: {
          email: user.email,
          lastLogin: user?.lastLogin
        }
      }
      const result=await usersCollection.updateOne(filter,updatedDoc)
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



app.get('/', (req, res) => {
  res.send('Juice shop is running')
})
app.listen(port, () => {
  console.log(`juice house is  running on port: ${port}`);
})

