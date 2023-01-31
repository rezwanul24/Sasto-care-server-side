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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
      return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
          return res.status(403).send({ message: 'Forbidden access' });
      }
      req.decoded = decoded;
      next();
  })
}

async function run(){
  try{
    const serviceCollection = client.db('sastohcare').collection('services');
    const reviewsCollection = client.db('sastohcare').collection('reviews');

    // login user 
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
      res.send({ token })
  })

    // get limit services 
    app.get('/homeServices', async (req, res) => {
      const size = parseInt(req.query.size);
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.sort({ service_id: -1 }).limit(size).toArray();
      const count = await serviceCollection.estimatedDocumentCount();
      res.send(services);
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