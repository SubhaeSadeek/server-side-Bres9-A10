require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5001;

const app = express();

// including MiddleWare
app.use(cors());
app.use(express.json());

// User [] password [hwnqZvJS4TyyTPYT]
// connection config for mongodb

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.i6qlf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const database = client.db("ChillGamerDB");
        const reviewCollection = database.collection("gameReview");
        const userCollection = database.collection("users")
        

        // reviews APIs::::::::::::::::::::::::
        // reading reviews
        app.get("/review", async (req, res) =>{
            const cursor = reviewCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/limitReview',async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const skip = (page - 1) * limit;
          
                      
            reviewCollection
              .find({})
              .sort({ ratingOfGame: -1 }) 
              .skip(skip)
              .limit(limit)
              .toArray()
              .then(reviews => {
                reviewCollection.countDocuments().then(total => {
                  res.json({
                    reviews,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                  });
                });
              })
              .catch(err => {
                console.error('Error fetching reviews:', err.message);
                res.status(500).json({ error: 'Server error' });
              });
          });
          
          
        // add review ....
        app.post("/review", async (req, res)=> {

            const ratingNum = parseInt(req.body.ratingOfGame, 10);
            if (isNaN(ratingNum)) {
              return res.send(400).json({ error: 'Rating must be a number' });
            }
            const newReview = {
                ...req.body,       
                ratingOfGame: ratingNum, 
              };
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        })







        // USER APIsssssssssssssssssss
        app.post("/user", async (req, res)=>{
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            console.log(result);
            res.send(result);
        })

       /*  const coffeeCollection = database.collection('coffeeDetails');
        const userCollection = database.collection('users'); */



    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) =>{
    res.send("Alhamdulillah, made this server for Assignment 10");
} )

app.listen(port, () =>{
    console.log(`the application is running in port ${[port]}`);
})