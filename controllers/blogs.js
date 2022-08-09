const blogRouter = require('express').Router();
const Blog = require('../models/blog');

blogRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

blogRouter.post('/', (request, response) => {
  if (request.body.title == undefined || request.body.url == undefined) {
    return response.status(400).json({
      error: 'title and url cannot be missing!',
    });
  }
  if (request.body.likes === undefined) {
    request.body.likes = 0;
  }
  const blog = new Blog(request.body);

  blog.save().then((result) => {
    response.status(201).json(result);
  });
});

blogRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findByIdAndDelete(request.params.id);

  if (blog) {
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
