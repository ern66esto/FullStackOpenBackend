const mongoose = require('mongoose');

if (process.argv.length > 5) {
    console.log('give password as argument');
    process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4]

const url = `mongodb+srv://ernestoleobardo:${password}@cluster0.q4jvwce.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    id: Number,
    name: String, 
    number: String
});

const Person = mongoose.model("Person", personSchema);

if (name !== undefined && number !== undefined) {
    //CREATE
    const person = new Person({
        name: name, 
        number: number
    });

    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`);
        mongoose.connection.close();
    });    
} else {
    // GET
    Person.find({}).then(result => {
        console.log("phonebook:");
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
});
} 





