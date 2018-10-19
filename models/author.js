const mongoose = require('mongoose');
const { Schema } = mongoose;

const authorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: Number
});

const Author = mongoose.model("Author", authorSchema);

module.exports = Author;