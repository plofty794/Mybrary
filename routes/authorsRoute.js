const express = require("express");
const router = express.Router();

//Authors route
router.get("/", (req, res) => {
    res.render("authors/index");
});

// New Author route
router.get("/new", (req, res) => {
    res.render("authors/new");
});

// Create Author route
router.post("/", (req, res) => {
    res.render("authors/new");
});

module.exports = router;
