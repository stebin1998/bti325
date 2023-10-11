

const express = require('express');
const path = require('path');
const app = express();
const blogService = require('./blog-service');
const HTTP_PORT = process.env.PORT || 8080;
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: 'dekwtccst',
  api_key: '364561955783746',
  api_secret: '1AgUtdDKvYqbLW4RhZoH4ye1xdI',
  secure: true
});

const upload = multer();

let streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

// Define the uploadToCloudinary function
async function uploadToCloudinary(req) {
  let result = await streamUpload(req);
  console.log(result);
  return result;
}

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/about.html'));
});
app.get('/posts/add', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/addPost.html'));
});

app.post('/posts/add', upload.single('featureImage'), async (req, res) => {
  try {
    const uploaded = await uploadToCloudinary(req);

    // Create a new blog post object based on req.body
    const newBlogPost = {
      title: req.body.title,
      content: req.body.content,
      featureImage: uploaded.url,
    };

    blogService.addPost(newBlogPost)
      .then(() => {
        // Redirect to /posts after adding the blog post
        res.redirect('/posts');
      })
      .catch((error) => {
        console.error('Error adding blog post:', error);
        res.status(500).send('Error adding blog post');
      });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).send('Error uploading image to Cloudinary');
  }
});

app.use('/app', (req, res) => {
  res.send("404 ERROR");
});

blogService.initialize()
  .then(() => {
    app.get('/blog', (req, res) => {
      blogService.getPublishedPosts()
        .then((posts) => {
          res.json(posts);
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    });
    app.get('/posts', (req, res) => {
      const { category, minDate,postId } = req.query;
    
      if (category) {
        // Filter posts by category
        blogService.getPostsByCategory(category)
          .then((filteredPosts) => {
            res.json(filteredPosts);
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      } else if (minDate) {
        // Filter posts by minimum date
        blogService.getPostsByMinDate(minDate)
          .then((filteredPosts) => {
            res.json(filteredPosts);
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      }
       else {
        // No filters, return all posts
        blogService.getAllPosts()
          .then((posts) => {
            res.json(posts);
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      }
    });
  app.get('/posts/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await blogService.getPostById(postId);

    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


    app.get('/Categories', (req, res) => {
      // Use blogService to fetch and send categories data
      blogService.getCategories()
        .then((categories) => {
          res.json(categories);
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    });

    // Start the server
    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on: http://localhost:${HTTP_PORT}`);
    });
  })
  .catch((error) => {
    console.error('Initialization error:', error);
  });
