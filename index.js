const express=require('express')
const app=express()
const port=process.env.PORT || 5000;
const stripe = require('stripe')('sk_test_51OEAXTFSdPUsKpuTb2tM6dSW33jFFjOWQA0eVoX1mJeW7u6fGcFY8lrYWsgBvy82U1yUnnscJPv0baOosBVuvqVS00bUo6CuGx')
require('dotenv').config()
const cors=require('cors')

app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const userCollection=client.db('phoneHouse').collection('users')
    const cartCollection=client.db('phoneHouse').collection('carts')
    const messageCollection=client.db('phoneHouse').collection('messages')
    const replayCollection=client.db('phoneHouse').collection('replay')
    const paymentCollection=client.db('phoneHouse').collection('payment')


          // PHONES COLLOCTION

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




app.put('/phones/:id',async(req,res)=>{
  const updatePhoneInfo=req.body 
  const id=req.params.id 
  const filter={_id:new ObjectId(id)}
  const options = { upsert: true }; 
  const updateDoc={
    $set:{
    
      image:updatePhoneInfo.image,
      phone_name:updatePhoneInfo.phone_name,
      brand_name:updatePhoneInfo.brand_name,
      price:updatePhoneInfo.price,
      rating:updatePhoneInfo.rating,
      release_date:updatePhoneInfo.release_date,
      displaySize:updatePhoneInfo.displaySize,
      storage:updatePhoneInfo.storage,
      sensors:updatePhoneInfo.sensors,
      bluetooth:updatePhoneInfo.bluetooth,
      usb:updatePhoneInfo.usb,
      android_version:updatePhoneInfo.android_version
    }
  }
  const result=await phoneCollection.updateMany(filter,updateDoc,options)
  res.send(result)
})











            // USER COLLECTION

  app.post('/users',async(req,res)=>{
    const userInfo=req.body
    console.log('User Uploaded',userInfo)
    const query={email:userInfo.email}
    const findUser=await userCollection.findOne(query)
    if(findUser){
      return res.status(401).send({message:'User Already Resistered',insertedId:null})
    }
    const result=await userCollection.insertOne(userInfo)
    res.send(result)
  })

app.get('/users',async(req,res)=>{
  const result=await userCollection.find().toArray()
  res.send(result)
})
 


                                       //CART COLLECTIOM


app.post('/carts',async(req,res)=>{
  const cartInfo=req.body
  console.log('cart info uploaded',cartInfo)
  const result=await cartCollection.insertOne(cartInfo)
  res.send(result)
})



app.get('/carts/:email',async(req,res)=>{
  const email=req.params.email
  const query={email:email}
  const result=await cartCollection.find(query).toArray()
  res.send(result)
})


app.delete('/carts/:id',async(req,res)=>{
  const id=req.params.id
  const query={_id:new ObjectId(id)}
  const cursor=await cartCollection.deleteOne(query)
  res.send(cursor)
})






                             //MESSAGE SECTION

app.post('/message',async(req,res)=>{
  const messageInfo=req.body
  console.log('Message uploaded',messageInfo)
  const result=await messageCollection.insertOne(messageInfo)
  res.send(result)
})                             





app.get('/message',async(req,res)=>{
  const result=await messageCollection.find().toArray()
  res.send(result)
})


app.delete('/message/:id',async(req,res)=>{
  const id=req.params.id 
  const query={_id:new ObjectId(id)}
  const result=await messageCollection.deleteOne(query)
  res.send(result)
})

             





//ADMIN ROLE


app.patch('/users/admin/:id',async(req,res)=>{
  const id=req.params.id 
  const filter={_id:new ObjectId(id)}
  const updateDoc={
    $set:{
      role:'admin'
    }
  }
  const result=await userCollection.updateOne(filter,updateDoc)
  res.send(result)
})











app.get('/users/admin/:email',async(req,res)=>{
  const email=req.params.email
  const query={email:email}
  const user=await userCollection.findOne(query)
  let admin=false 
  if(user){
    admin=user?.role==='admin'
  }
  res.send({admin})
})
                       



//REPLAY MESSAGES


app.post('/replay',async(req,res)=>{
  const replayInfo=req.body
  console.log('replay uploaded',replayInfo)
  const result=await replayCollection.insertOne(replayInfo)
  res.send(result)
})                     


app.get('/replay',async(req,res)=>{
  const result=await replayCollection.find().toArray()
  res.send(result)
})






//PAYMENT    


app.post('/create-payment-intent',async(req,res)=>{
  const {price}=req.body

  const paymentIntent=await stripe.paymentIntents.create({
  amount:parseInt(price*100),
  currency:'usd',
  payment_method_types:['card']
 })


 res.send({
  clientSecret:paymentIntent.client_secret
 })


})




app.post('/payment',async(req,res)=>{
  const paymentInfo=req.body
  console.log('Payment uploded',paymentInfo)
  const paymentData=await paymentCollection.insertOne(paymentInfo) 
 const query={_id:{
  $in:paymentInfo.paymentorCartId.map(id=>new ObjectId(id))
  
 }}

 const deleteCart=await cartCollection.deleteMany(query)


res.send({paymentData,deleteCart})



})

app.get('/payment/:email',async(req,res)=>{
  const paymentorEmail=req.params.email
  const query={email:paymentorEmail}
  const result=await paymentCollection.find(query).toArray()
  res.send(result)
})






//ADMIN STATS

app.get('/admin-stats',async(req,res)=>{
const totalPhone=await phoneCollection.estimatedDocumentCount()
const totalUser=await userCollection.estimatedDocumentCount()
const totalMessage=await  messageCollection.estimatedDocumentCount()
const totalPayments=await paymentCollection.estimatedDocumentCount()

const totalAmount=await paymentCollection.aggregate([

{
  $group:{
    _id:null,
    totalRevenue:{
      $sum:'$totalAmount'
    }
  }

}


]).toArray()

const totalMoney=totalAmount.length>0?totalAmount[0].totalRevenue:0



res.send({
  totalPhone,totalUser,totalMessage,totalPayments,totalMoney
})


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

