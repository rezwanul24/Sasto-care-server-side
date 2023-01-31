const express = require('express')
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.wm2o919.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

  function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(401).send({massage: 'unauthorize access'})
    }

    const token = authHeader.splite(' ')[1];
    jwt.verif(token, process.env.ACCESS_TOKEN_SECRET, function(error, decoded){
      if(error){
        res.status(401).send({massage: 'forbeden access'})
      }
      req.decoded = decoded;
      next()
    })
  }

async function run(){
  try{
    const serviceCollection = client.db('sastohcare').collection('services');
    const reviewsCollection = client.db('sastohcare').collection('reviews');

    app.post('/jwt', (req,res)=> {
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
      res.send({token})
    })

    // add service 
    app.post('/service', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
  });

  }
  
  finally{
  
  }
  
  
}

run().catch(error => console.log(error));


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})