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

 

// get single service 
app.get('/service/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send(service);
});


   // get all services 
   app.get('/services', async (req, res) => {
    const query = {}
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);
  });

// add service 
app.post('/service', verifyJWT, async (req, res) => {
  const service = req.body;
  const result = await serviceCollection.insertOne(service);
  res.send(result);
});

// get reviews for service
app.get('/reviews', async (req, res) => {
  const id = req.query.id;
  const query = { service_id: parseInt(id) };
  const reviews = await reviewsCollection.find(query).sort({ datefield: -1 }).toArray();
  const forSort = reviews.sort().reverse();
  res.send(forSort);
});


  // get reviews for my reviews
  app.get('/myReviews', verifyJWT, async (req, res) => {
    const decoded = req.decoded;
    if (decoded.email !== req.query.email) {
        res.status(403).send({ message: 'unauthorized access' })
    }
    let query = {};
    if (req.query.email) {
        query = {
            email: req.query.email
        }
    }
    const reviews = await reviewsCollection.find(query).toArray();
    res.send(reviews);
});

// add review 
app.post('/reviews', verifyJWT, async (req, res) => {
    const review = req.body;
    const result = await reviewsCollection.insertOne(review);
    res.send(result);
});

// update review 
app.patch('/review/:id', verifyJWT, async (req, res) => {
    const id = req.params.id;
    const data = req.body
    const query = { _id: ObjectId(id) }
    const updatedDoc = {
        $set: {
            comment: data.comment,
            rating: data.rating
        }
    }
    const result = await reviewsCollection.updateOne(query, updatedDoc);
    res.send(result);
})

// delete review
app.delete('/review/:id', verifyJWT, async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await reviewsCollection.deleteOne(query);
    res.send(result);
})


  }
  
  finally{
  
  }
  
  
}

run().catch(error => console.log(error));


app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})