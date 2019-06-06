const express = require('express');
const fs = require('fs')

const Mew = require('./src/models/meowtcha');
const trainingData = require('./train_data/data.json');

const app = express();

let mew = { status: 'mewing!' }

let solver = new Mew(trainingData);

app.get('*', (res, req)=>{
    req.json(mew);
})

const handleUpload = (req, res, next) => {
    req.on('data', (data)=>{
        req.data = data;
    })
    req.on('end', next);
}

app.post('/detect', handleUpload, (req,res) => {
    const capa = req.data;
    solver.solveMeowtcha(capa, (result) =>{
        if(result == null) {
            res.json({ text: null });
        } else {
            res.json({ text: result.join("") });
        }
    })
})

solver.init(()=>{
    mew.status = 'mew!';
    app.listen(3131);
});
