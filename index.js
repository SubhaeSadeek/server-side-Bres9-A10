require("dotenv").config();
const express = require("express");
const port = process.env.PORT || 5000;

const app = express();



app.get("/", (req, res) =>{
    res.send("Alhamdulillah, made this server for Assignment 10");
} )

app.listen(port, () =>{
    console.log(`the application is running in port ${[port]}`);
})