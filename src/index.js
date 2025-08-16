import connectdb from "./db/db_connection.js";
import app from "./app.js";
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
});


connectdb()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`Server is runnng at localhost:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed! ", err)
});



