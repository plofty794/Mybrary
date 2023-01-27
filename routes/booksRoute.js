const express = require("express");
const router = express.Router();
const Book = require("../model/books");
const Author = require("../model/author");

//Books route
router.get("/", async (req, res) => {
    res.render("books/index");
});

// New Book route
router.get("/new", async (req, res) => {
    try {
        const authors = await Author.find({});
        const book = new Book();
        res.render("books/new", {
            authors: authors,
            book: book,
        });
    } catch (error) {
        res.redirect("/books");
    }
});

// Create Book route
router.post("/", async (req, res) => {
    const book = new Book({
        title: req.body.title,
        authors: req.body.authors,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: req.body.coverImageName,
        description: req.body.description,
    });
    try {
        const newBook = await book.save();
        res.redirect("/");
    } catch (error) {
        res.render("books/new", {
            book: book,
            errorMessage: "Error creating book",
        });
    }
});

module.exports = router;
