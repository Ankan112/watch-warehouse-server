const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const ObjectId = require("mongodb").ObjectId;
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rjdqp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri)

async function run() {
    try {
        await client.connect();
        const database = client.db("watchDB");
        const productsCollection = database.collection("products");
        const reviewCollection = database.collection("reviews")
        const ordersCollection = database.collection("orders")
        const userCollection = database.collection('user')

        // POST Api (create products)
        app.post('/products', async (req, res) => {
            const result = await productsCollection.insertOne(req.body)
            res.json(result)
        })
        // GET api (get all products)
        app.get('/products', async (req, res) => {
            const products = await productsCollection.find({}).toArray();
            res.send(products)
        })
        // GET single product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const qurey = { _id: ObjectId(id) }
            const result = await productsCollection.find(qurey).toArray();
            res.send(result)
        })
        // Delete Product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.json(result);
        })
        // POST api (create Orders)
        app.post('/orders', async (req, res) => {
            const result = await ordersCollection.insertOne(req.body)
            res.json(result);
        })
        // GET api (get all orders)
        app.get('/orders', async (req, res) => {
            const orders = await ordersCollection.find({}).toArray()
            res.send(orders)
        })
        // GET my orders
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await ordersCollection.find(query).toArray()
            res.send(result)
        })
        // Delete Order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result)
        })
        // POST api (create Review)
        app.post('/review', async (req, res) => {
            // console.log('hitting the post', req.body)
            // res.send('hit the post')
            const result = await reviewCollection.insertOne(req.body)
            res.json(result)
        })
        // GET ALL Reviews
        app.get('/review', async (req, res) => {
            const review = await reviewCollection.find({}).toArray()
            res.send(review)
        })
        // Admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await userCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })
        // POST api
        app.post('/users', async (req, res) => {
            const result = await userCollection.insertOne(req.body)
            res.json(result)
        })
        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })
        // PUT api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Assignment')
})
app.listen(port, () => {
    console.log('Listening To Port', port)
})