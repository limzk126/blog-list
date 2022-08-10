const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });

  response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
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
    user: request.user._id.toString(),
  });

  const savedBlog = await blog.save();
  request.user.blogs = request.user.blogs.concat(savedBlog._id);
  await request.user.save();

  response.status(200).json(savedBlog);
});

blogRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  const userId = request.user._id.toString();

  if (blog.user.toString() !== userId) {
    return response.status(400).json({
      error: 'You cannot delete blogs that are not created by you',
    });
  }

  const deletedBlog = await blog.delete();
  request.user.blogs = request.user.blogs.filter((blog) => {
    return blog.toString() !== deletedBlog._id.toString();
  });
  await request.user.save();

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
