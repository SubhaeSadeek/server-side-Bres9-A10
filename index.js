require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
        const addWatchListCollection = database.collection("addWatchList");
        const userCollection = database.collection("users")
        

        // reviews APIs::::::::::::::::::::::::
        // reading reviews
        app.get("/review", async (req, res) =>{ /* fetching all review to allREview PAGE */
            const cursor = reviewCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get("/review/:id", async (req, res)=>{ /* Fetching for review detail page */
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await reviewCollection.findOne(query);
          res.send(result);
        });
        
        // API for My Review (User specific review for the user)
        app.post("/review", async (req, res)=>{ /* fetching user specific review to myReview PAGE */
          const {email} = req.body;
          const cursor = reviewCollection.find({email:email});
          const result = await cursor.toArray();
          res.send(result);
        });

        // API for limiting 6 data per page with rating sorted
        app.get('/limitReview',async (req, res) => { /* READING all review and fetched to Home Page */
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
          // API for reading add to watch list
          app.post("/myWatchList", async (req, res)=>{ /* reading my watchlist via email throuogh post method for better scurity. it is from myWatchList PAGE */
            const {userEmail} = req.body;
            const cursor = addWatchListCollection.find({watchListEmail:userEmail});
            const result = await cursor.toArray();
            res.send(result)
          });
   






        // API for Write in Db &&&&&&&&&&&&&&&&&&&&&&&&
          
        // add review ....
        app.post("/addReview", async (req, res)=>{ /* add REview from add Review form */
          const ratingNum = parseInt(req.body.ratingOfGame, 10);
            const newReview = {
              ...req.body,
              ratingOfGame: ratingNum,
            };
          const result = await reviewCollection.insertOne(newReview);
          res.send(result);
      });
        
        //API for add review IN WATCHLIST
        app.post("/addWatchList", async (req, res)=>{ /* adding watchlist from detail card */
          const newWatchList = req.body;
          const result = await addWatchListCollection.insertOne(newWatchList);
          res.send(result);
        });


        // Add USER APIsssssssssssssssssss
        app.post("/user", async (req, res)=>{ /* add user drom register form */
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        });

        /* ***************************************** */
        // API for UPDATE data
        /* ***************************************** */
        app.put('/review/:id', async (req, res) => { /* update review from myReview card */
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const options = { upsert: true };
          const updatedDoc = {
              $set: req.body
          }

          const result = await reviewCollection.updateOne(filter, updatedDoc, options )

          res.send(result);
      });

        /* ***************************************** */
        // API for delete data
        /* ***************************************** */
        app.delete('/myWatchList/:id', async (req, res) => { /* deleting frm myWatchList card */
         
          const id = req.params.id;
          const query = { _id: id }
          const result = await addWatchListCollection.deleteOne(query);
          res.send(result);
      });

      // deleting for myREview Card
      app.delete("/myReview/:id", async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await reviewCollection.deleteOne(query);
        res.send(result);
      })
      

       



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