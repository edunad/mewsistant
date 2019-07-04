const express = require('express');
const fs = require('fs')
const sizeOf = require('image-size')

const Mew = require('./src/models/meowtcha');
const trainingData = require('./train_data/data.json');

const app = express();

let solver = new Mew(trainingData);

app.get('*', (res, req)=>{
    req.json({ status: "OK", uptime: process.uptime() });
})

const handleUpload = (req, res, next) => {
    if(req.headers['content-length'] > 5000) return res.status(400).json({ text: null, message: `Image is too big`})

    req.on('data', (data)=>{
        req.data = data;
    })

    req.on('end', ()=>{
        try {
            const size = sizeOf(req.data)
            if(size.width == 180 && size.height == 45) return next()
        } catch(e){
            res.status(400).json({ text: null, message: "Invalid request"})
        }
    })
}

app.post('/detect', handleUpload, (req,res) => {
    const capatchaImage = req.data;
    solver.solveMeowtcha(capatchaImage, (result) =>{
        if(result == null) return res.status(400).json({ text: null, message: "Unable to resolve" })
        
        res.json({ text: result.join("") })
    })
})

solver.init(()=>{
    console.info(`meowtcha initialized`)
    app.listen(3131, ()=>{
        console.info(`webserver started`)
    });
});
