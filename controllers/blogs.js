const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });

  response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid',
    });
  }
  if (request.body.title == undefined || request.body.url == undefined) {
    return response.status(400).json({
      error: 'title and url cannot be missing!',
    });
  }
  if (request.body.likes === undefined) {
    request.body.likes = 0;
  }

  const blog = new Blog({
    ...request.body,
    user: decodedToken.id,
  });

  const savedBlog = await blog.save();
  const user = await User.findById(decodedToken.id);
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(200).json(savedBlog);
});

blogRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (blog.user.toString() !== decodedToken.id.toString()) {
    return response.status(400).json({
      error: 'You cannot delete blogs that are not created by you',
    });
  }
  const deletedBlog = await blog.delete();
  const user = await User.findById(decodedToken.id);
  user.blogs = user.blogs.filter((blog) => {
    return blog.toString() !== deletedBlog._id.toString();
  });
  await user.save();

  if (deletedBlog) {
    return response.status(204).end();
  }
});

blogRouter.put('/:id', async (request, response) => {
  console.log(request.body);
  const blog = await Blog.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
  });

  return response.status(200).json(blog);
});

module.exports = blogRouter;
