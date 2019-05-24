
const fs = require('fs-extra');
const colors = require('colors');
const Trainer = require('./src/models/trainer');
const trainingData = require('./train_data/data.json');
const DEBUG = false;

function init() {
    // only if training module not found
    prepareTrainingFolders();
}

function prepareTrainingFolders() {
    fs.ensureDir('./fault_training').then(() => {
        fs.ensureDir('./letters').then(() => {
            fs.emptyDir('./fault_training').then(() => {
                fs.emptyDir('./letters').then(() => {
                    startTraining();
                });
            });
        });
    });
}

function startTraining() {
    let train = new Trainer(trainingData);

    train.prepareData(() => {
        if(DEBUG){
            let dataKeys = Object.keys(train.letterData);
            
            console.debug('== Training data ==');
            console.debug('== Total Letters : ' + dataKeys.length.toString().red + ' =='.white);
            dataKeys.forEach((key) => {
                console.debug('== ' + key.toString().red + ' -> ' + train.letterData[key].length.toString().green);
            });
        }

        train.buildTrainModel();
    });
}

init();