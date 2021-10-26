const express = require ('express');
const app = express();
const { MongoClient } = require('mongodb');
require('dotenv').config()


const cors = require('cors');
const port = process.env.PORT || 5000;

//middlewere
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qe1gc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db("online_shop");
        const productCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        
        //Get Products Api
        app.get('/products',async(req,res)=>{
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();

            if(page){
                products=await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();
            }
            res.send({
                count,
                products
                
            })
        });
        // use post to get api
        app.post('/products/:bykeys', async(req,res)=>{
            const keys = req.body;
            const query = {key : {$in: keys}};
            const products = await productCollection.find(query).toArray();
            res.json(products)
        });

        // add orders api
        app.post('/orders', async(req,res)=>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result)
        })

    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir);




app.get('/',(req,res)=>{
    res.send("ema-jhon server is running");
})
app.listen(port,()=>{
    console.log("servet runnign at port",port);
})