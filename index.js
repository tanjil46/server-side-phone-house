const express=require('express')
const app=express()
const port=process.env.PORT || 5000;

require('dotenv').config()
const cors=require('cors')

app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u2o3a1l.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
  
    const phoneCollection=client.db('phoneHouse').collection('allPhones')



app.post('/phones',async(req,res)=>{
    const phoneInfo=req.body
    console.log('Phone Info Uploaded',phoneInfo)
    const result=await phoneCollection.insertOne(phoneInfo)
    res.send(result)
})


  app.get('/phones',async(req,res)=>{
    const result=await phoneCollection.find().toArray()
    res.send(result)
  })







    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);















app.get('/',(req,res)=>{
  
    res.send('phone house Server is Running')

})

app.listen(port)

