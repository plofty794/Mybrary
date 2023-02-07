const express = require("express");
const router = express.Router();
const Author = require("../model/author");

//Authors route
router.get("/", async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null || req.query.name !== "") {
        searchOptions.name = new RegExp(req.query.name, "gi");
    }
    try {
        const authors = await Author.find(searchOptions);
        res.render("authors/index", {
            authors: authors,
            searchOptions: req.query,
        });
    } catch {
        res.redirect("/");
    }
});

// New Author route
router.get("/new", (req, res) => {
    res.render("authors/new", { author: new Author() });
});

// Create Author route
router.post("/", async (req, res) => {
    const author = new Author({
        name: req.body.name,
    });
    try {
        const newAuthor = await author.save();
        res.redirect(`authors/${newAuthor.id}`);
    } catch {
        res.render("authors/new", {
            author: author,
            errorMessage: "Error creating author",
        });
    }
});

router.get("/:id", (req, res) => {
    res.send(`Show Author ${req.params.id}`);
});

router.get("/:id/view", (req, res) => {
    res.send(`View Author ${req.params.id}`);
});

router.get("/:id/edit", async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.render("authors/edit", { author: author });
    } catch (error) {
        res.redirect("/authors");
    }
});

router.put("/:id", async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);
    } catch (error) {
        if (author == null) {
            res.redirect("/");
        } else {
            res.redirect(`/authors/${req.params.id}/edit`, {
                author: author,
                errorMessage: "Error updating author",
            });
        }
    }
});

router.delete("/:id", (req, res) => {
    res.send(`Delete Author ${req.params.id}`);
});

module.exports = router;
