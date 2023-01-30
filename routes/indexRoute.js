const express = require("express");
const router = express.Router();
const Book = require("../model/books");

router.get("/", async (req, res) => {
    let books;
    try {
        books = await Book.find()
            .sort({ createdAt: "descending" })
            .limit(10)
            .exec();
        res.render("index", {
            books: books,
        });
    } catch (error) {
        books = [];
    }
});

module.exports = router;
