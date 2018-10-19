const express = require("express");
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

router.get("/", async (req, res, next) => {
    if (req.query.name) {
        try {
            const author = await Author.find({ name: req.query.name });
            let id = author[0].id;
            const results = await Book.find({ author: id });
            res.status(200).json({
                author,
                books: results
            })
        } catch (err) {
            res.status(404).json({ message: `${err.message}` });
        }
    }
    else {
        try {
            const results = await Author.find();
            res.status(200).json(results)
        } catch (err) {
            res.status(404).json({ message: `${err.message}` });
        }
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const author = await Author.findById(req.params.id);
        if (author !== null) {
            const books = await Book.find({ author: req.params.id });
            res.status(200).json({
                author,
                books: books
            })
        }
        else { res.status(404).json({ message: `author with id ${req.params.id} not found!` }) }
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const author = new Author(req.body)
        await author.save();
        res.status(201).json({ message: `created new author with name ${req.body.name} ` });
    } catch (err) {
        res.status(400).json({ message: `${err.message} ` });
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        const results = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({
            message: `updated author with id "${req.params.id}"`,
            result: results
        });
    } catch (err) {
        res.status(400).json({ message: `${err.message} ` });
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        await Author.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: `deleted author with id "${req.params.id}"`,
        });
    } catch (err) {
        res.status(404).json({ message: `${err.message} ` });
    }
});

module.exports = router;