const express = require("express");
const router = express.Router();
const Book = require('../models/book');

/* GET books listing. */
router.get("/", async (req, res, next) => {
  try {
    const results = await Book.find().populate("author");
    res.status(200).json(results)
  } catch (err) {
    res.status(404).json({ message: `${err.message}` });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const results = await Book.findById(req.params.id);
    if (results !== null) {
      res.status(200).json({
        message: `found book with id ${req.params.id}`,
        result: results
      })
    }
    else { res.status(404).json({ message: `book with id ${req.params.id} not found!` }) }
  } catch (err) {
    res.status(404).json({ message: `${err.message} ` });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const book = new Book(req.body)
    await book.save();
    res.status(201).json({ message: `created new book with title ${req.body.title} ` });
  } catch (err) {
    res.status(400).json({ message: `${err.message} ` });
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const results = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
      message: `updated book with id "${req.params.id}"`,
      result: results
    });
  } catch (err) {
    res.status(400).json({ message: `${err.message} ` });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: `deleted book with id "${req.params.id}"`,
    });
  } catch (err) {
    res.status(404).json({ message: `${err.message} ` });
  }
});

module.exports = router;
