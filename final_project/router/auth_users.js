const dotenv = require("dotenv");
const express = require("express");
const session = require("express-session");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
// Load environment variables from .env file
dotenv.config();

regd_users.use(express.json());

const secretKey = process.env.SECRET_KEY; // Use the secret from the environment variable
// Ensure the secretKey is loaded
if (!secretKey) {
  console.error("FATAL ERROR: SECRET_KEY is not defined.");
  process.exit(1); // Exit the application with an error code
}

// Session middleware setup
regd_users.use(
  session({
    secret: secretKey, // Use the secret from the environment variable
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate the request
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Find the user in the users array
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // User found and authenticated, generate a JWT
  const token = jwt.sign({ username: user.username }, secretKey, {
    expiresIn: "1h",
  });

  // Store the token in the session
  req.session.authorization = { accessToken: token };

  // Send the token to the client
  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.user.username;

  // Validate the request
  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }
  // Find the book by ISBN
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Determine if this is a new review or an update
  const isNewReview = !books[isbn].reviews[username];

  // Add or modify the review
  books[isbn].reviews[username] = review;

  // Return the appropriate message
  return res.status(200).json({
    message: isNewReview
      ? "Review added successfully"
      : "Review modified successfully",
    reviews: books[isbn].reviews,
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username;

  // Find the book by ISBN
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the review exists
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  // Return a success message
  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
