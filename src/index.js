// require('dotenv').config({path: './env'})     //can also works but not recommended for consistency of code

import dotenv from 'dotenv';

import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    const porting = process.env.PORT || 7000;
    app.listen(porting, () => {
        console.log(`Server is running on port : ${porting}`);
    })
})
.catch((e) => {
    console.log("MONGO db Connection failed !!! ", e);
})



/* First Approach to connect

import express from 'express'

const app = express()

(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error", (e) => {
            console.log("app is not able to listen", e);
            throw e;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }
    catch(e){
        console.error("ERROR: ", e)
        throw e
    }
})()

*/