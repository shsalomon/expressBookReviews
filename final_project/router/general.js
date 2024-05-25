const express = require("express");
const Joi = require("joi");

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if the username already exists
  const userExists = users.find((user) => user.username === req.body.username);
  if (userExists) {
    return res.status(400).send("Username already exists");
  }

  const user = {
    username: req.body.username,
    password: req.body.password,
  };
  users.push(user);
  res.send(user);
  res.status(201).send("User registered successfully");
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  res.send(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const book = books[req.params.isbn];
  if (!book)
    return res.status(404).send("The boook with the given ISBN was not found.");
  res.send(book);
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const bookIds = Object.keys(books);
  const matchingBooks = [];

  for (let isbn of bookIds) {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    res.send(matchingBooks);
  } else {
    res.status(404).send("No books found by this author");
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const bookIds = Object.keys(books);
  const matchingBooks = [];

  for (let isbn of bookIds) {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      matchingBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    res.send(matchingBooks);
  } else {
    res.status(404).send("No books found by this author");
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const book = books[req.params.isbn];
  if (!book)
    return res.status(404).send("The boook with the given ISBN was not found.");
  res.send(book.reviews);
});

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.any().required(),
  });
  return schema.validate(user);
}

module.exports.general = public_users;
