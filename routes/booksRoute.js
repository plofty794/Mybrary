const express = require("express");
const router = express.Router();
const Book = require("../model/books");
const Author = require("../model/author");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

//Books route
router.get("/", async (req, res) => {
    let query = Book.find();
    if (req.query.title != null && req.query.title !== "") {
        query = query.regex("title", new RegExp(req.query.title, "gi"));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore !== "") {
        query = query.lte("publishDate", req.query.publishedBefore);
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter !== "") {
        query = query.gte("publishDate", req.query.publishedAfter);
    }
    try {
        const books = await query.exec();
        res.render("books/index", {
            books: books,
            searchOptions: req.query,
        });
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
});

// New Book route
router.get("/new", async (req, res) => {
    renderNewPage(res, new Book());
});

// Create Book route
router.post("/", async (req, res) => {
    const book = new Book({
        title: req.body.title,
        authors: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    });
    saveCoverImage(book, req.body.cover);
    try {
        const newBook = await book.save();
        res.redirect("books");
    } catch (error) {
        console.error(error);
        renderNewPage(res, book, true);
    }
});

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book,
        };
        if (hasError) params.errorMessage = "Error creating book";
        res.render("books/new", params);
    } catch (error) {
        res.redirect("/books");
    }
}

function saveCoverImage(book, encodedCover) {
    if (encodedCover == null) return;
    const cover = JSON.parse(encodedCover);
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, "base64");
        book.coverImageType = cover.type;
    }
}

module.exports = router;
