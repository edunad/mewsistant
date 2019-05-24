
const colors = require('colors');

const Mew = require('./src/models/meowtcha');
const trainingData = require('./train_data/data.json');

// Clear screen
process.stdout.write("\u001b[2J\u001b[0;0H");

let solver = new Mew(trainingData);
solver.init(() => {
    for(let i = 100; i < 200; i++){
        let img = `./train_data/img/${i}.jpg`
        solver.solveMeowtcha(img, (result) => {
            if(result == null) console.debug(img.red + '\nSorry'.white + ' Meowster'.magenta + ", mew could not figure it out ".white + ' (=;-ω-;=)\n\n');
            else console.debug(img.green +'\nMeowster'.magenta + ", i think it's ".white + result.toString().inverse + " (=^-ω-^=)\n\n");
        });
    }
});
