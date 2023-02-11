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
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    });
    saveCoverImage(book, req.body.cover);
    try {
        const newBook = await book.save();
        res.redirect(`/books/${newBook.id}`);
    } catch {
        renderNewPage(res, book, true);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate({ path: "author", select: "name" })
            .exec();
        res.render("books/view", { book: book });
    } catch {
        res.redirect("/");
    }
});

router.get("/:id/edit", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } catch (error) {
        res.redirect("/");
    }
});

router.patch("/:id", async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.description = req.body.description;
        if (book.cover != null && book.cover !== "") {
            saveCoverImage(book, book.cover);
        }
        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch {
        if (book != null) {
            renderEditPage(res, book, true);
        }
        res.redirect("/");
    }
});

router.delete("/:id", async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect("/books");
    } catch {
        if (book != null) {
            res.render("book/view", {
                book: book,
                errorMessage: "Couldn't delete book",
            });
        }
        res.redirect("/");
    }
});

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, "new", hasError);
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, "edit", hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book,
        };
        if (hasError) {
            if (form === "edit") {
                params.errorMessage = "Error updating book";
            } else {
                params.errorMessage = "Error creating book";
            }
        }
        res.render(`books/${form}`, params);
    } catch {
        res.redirect("/");
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
