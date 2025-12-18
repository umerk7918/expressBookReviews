const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000"; // Adjust to your server URL

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

// Simulated async function using Promise
const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (error) {
      reject(error);
    }
  });
};

// Get book by ISBN using Promise
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("ISBN not found"));
    }
  });
};

// Get books by author using Promise
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    const matchingBooks = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author.toLowerCase()
    );
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject(new Error("No books by that author"));
    }
  });
};

// Get book by title using Promise
const getBookByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const matchingBook = Object.values(books).find(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );
    if (matchingBook) {
      resolve(matchingBook);
    } else {
      reject(new Error("Title not found"));
    }
  });
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Missing username or password" });
  } else if (doesExist(username)) {
    return res.status(404).json({ message: "user already exists." });
  } else {
    users.push({ username: username, password: password });
    return res
      .status(200)
      .json({ message: "User successfully registered. Please login." });
  }
});

// Task 10: Get all books using async/await with Axios
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Alternative: Get all books using Promise callbacks
public_users.get("/promise", (req, res) => {
  getAllBooks()
    .then((allBooks) => {
      return res.status(200).send(JSON.stringify(allBooks, null, 4));
    })
    .catch((error) => {
      return res.status(500).json({ message: error.message });
    });
});

// Task 11: Get book details based on ISBN using async/await
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const targetISBN = req.params.isbn;
    const targetBook = await getBookByISBN(targetISBN);
    return res.status(200).json(targetBook);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Alternative: Get book by ISBN using Promise callbacks
public_users.get("/isbn-promise/:isbn", (req, res) => {
  const targetISBN = req.params.isbn;
  getBookByISBN(targetISBN)
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((error) => {
      return res.status(404).json({ message: error.message });
    });
});

// Task 12: Get book details based on author using async/await
public_users.get("/author/:author", async (req, res) => {
  try {
    const author = req.params.author;
    const matchingBooks = await getBooksByAuthor(author);
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Alternative: Get books by author using Promise callbacks
public_users.get("/author-promise/:author", (req, res) => {
  getBooksByAuthor(req.params.author)
    .then((books) => {
      return res.status(200).send(JSON.stringify(books, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: error.message });
    });
});

// Task 13: Get book details based on title using async/await
public_users.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const matchingTitle = await getBookByTitle(title);
    return res.status(200).json(matchingTitle);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Alternative: Get book by title using Promise callbacks
public_users.get("/title-promise/:title", (req, res) => {
  getBookByTitle(req.params.title)
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((error) => {
      return res.status(404).json({ message: error.message });
    });
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const targetISBN = req.params.isbn;
  const targetBook = books[targetISBN];
  if (targetBook) {
    return res.status(200).send(JSON.stringify(targetBook.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "ISBN not found." });
  }
});

// ========== AXIOS CLIENT EXAMPLES ==========

// Example function to call the API endpoints using Axios with async/await
async function fetchAllBooksWithAxios() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("All Books:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error.message);
  }
}

// Example: Fetch book by ISBN using Axios with async/await
async function fetchBookByISBNWithAxios(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    console.log(`Book with ISBN ${isbn}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
  }
}

// Example: Fetch books by author using Axios with Promise callbacks
function fetchBooksByAuthorWithPromise(author) {
  axios
    .get(`${BASE_URL}/author/${author}`)
    .then((response) => {
      console.log(`Books by ${author}:`, response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(`Error fetching books by ${author}:`, error.message);
    });
}

// Example: Fetch book by title using Axios with async/await
async function fetchBookByTitleWithAxios(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${title}`);
    console.log(`Book with title "${title}":`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with title "${title}":`, error.message);
  }
}

// Example: Fetch book by title using Axios with Promise callbacks
function fetchBookByTitleWithPromise(title) {
  return axios
    .get(`${BASE_URL}/title/${title}`)
    .then((response) => {
      console.log(`Book with title "${title}":`, response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(`Error fetching book with title "${title}":`, error.message);
      throw error;
    });
}

// Uncomment to test the functions
// fetchAllBooksWithAxios();
// fetchBookByISBNWithAxios(1);
// fetchBooksByAuthorWithPromise("Chinua Achebe");
// fetchBookByTitleWithAxios("Things Fall Apart");

module.exports.general = public_users;
module.exports.fetchAllBooksWithAxios = fetchAllBooksWithAxios;
module.exports.fetchBookByISBNWithAxios = fetchBookByISBNWithAxios;
module.exports.fetchBooksByAuthorWithPromise = fetchBooksByAuthorWithPromise;
module.exports.fetchBookByTitleWithAxios = fetchBookByTitleWithAxios;
