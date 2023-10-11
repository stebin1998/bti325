const fs = require('fs');
const path = require('path');

// Paths to data files
const postsFilePath = path.join(__dirname, 'data', 'Posts.json');
const categoriesFilePath = path.join(__dirname, 'data', 'Categories.json');

// Global arrays to store data
let posts = [];
let categories = [];

// Function to read and parse JSON file
function readAndParseJSONFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(`Unable to read file: ${filePath}`);
        return;
      }
      try {
        const parsedData = JSON.parse(data);
        resolve(parsedData);
      } catch (error) {
        reject(`Error parsing JSON file: ${filePath}`);
      }
    });
  });
}

// Initialize the module by reading and loading data files
function initialize() {
  return Promise.all([
    readAndParseJSONFile(postsFilePath).then((data) => (posts = data)),
    readAndParseJSONFile(categoriesFilePath).then((data) => (categories = data)),
  ]);
}

// Function to get all posts
function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length === 0) {
      reject('No results returned');
    } else {
      resolve(posts);
    }
  });
}

// Function to get published posts
function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter((post) => post.published === true);
    if (publishedPosts.length === 0) {
      reject('No results returned');
    } else {
      resolve(publishedPosts);
    }
  });
}

// Function to get all categories
function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject('No results returned');
    } else {
      resolve(categories);
    }
  });
}
// Function to add a new post
function addPost(postData) {
  return new Promise((resolve, reject) => {
    postData.published = postData.published === undefined ? false : true;
    postData.id = posts.length + 1;
    posts.push(postData);
    resolve(postData);
  });
}
// Function to get posts by category
function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => post.category == category);
    if (filteredPosts.length === 0) {
      reject('No posts found for the specified category');
    } else {
      resolve(filteredPosts);
    }
  });
}

// Function to get posts by minimum date
function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const minDate = new Date(minDateStr);
    const filteredPosts = posts.filter((post) => new Date(post.postDate) >= minDate);
    if (filteredPosts.length === 0) {
      reject('No posts found with the specified minimum date');
    } else {
      resolve(filteredPosts);
    }
  });
}

// Function to get a post by ID
function getPostById(id) {
  return new Promise((resolve, reject) => {
    const postId = parseInt(id);

    if (!isNaN(postId)) {
      const post = posts.find((post) => post.id === parseInt(id));


      if (post) {
        resolve(post);
      } else {
        reject('Post not found.');
      }
    } else {
      reject('Invalid ID format. Please provide a numeric ID.');
    }
  });
}



module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
};
