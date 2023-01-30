const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const Book = require("../model/books");
const Author = require("../model/author");
const multer = require("multer");
const bookCoverPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
    dest: bookCoverPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    },
});

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
router.post("/", upload.single("cover"), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        authors: req.body.authors.trim(),
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description,
    });
    try {
        const newBook = await book.save();
        res.redirect("books");
    } catch (error) {
        console.error(error);
        book.coverImageName && removeBookCover(book.coverImageName);
        renderNewPage(res, book, true);
    }
});

function removeBookCover(fileName) {
    fs.unlink(path.join(bookCoverPath, fileName), (err) => {
        if (err) throw err;
    });
}

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

module.exports = router;
