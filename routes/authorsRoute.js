const express = require("express");
const router = express.Router();
const Author = require("../model/author");

//Authors route
router.get("/", (req, res) => {
    res.render("authors/index");
});

// New Author route
router.get("/new", (req, res) => {
    res.render("authors/new", { author: new Author() });
});

// Create Author route
router.post("/", (req, res) => {
    const author = new Author({
        name: req.body.name,
    });
    author.save(
        (err,
        (newAuthor) => {
            if (err) throw err;
        })
    );
    res.send(req.body.name);
});

module.exports = router;
