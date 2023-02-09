const mongoose = require("mongoose");
const Book = require("./books");

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

authorSchema.pre("remove", async function () {
    const books = await Book.find({ author: this.id });
    if (books.length > 0) {
        throw new Error("This author still has books!");
    }
});

module.exports = mongoose.model("Author", authorSchema);
