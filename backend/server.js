const express=require('express');
require('dotenv').config();
const app=express(); //create express app

const PORT=process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send('Hello from Express');
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
