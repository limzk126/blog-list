const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const api = supertest(app);

const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.listWithMultipleBlogs.map(
    (blog) => new Blog(blog)
  );
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test('blogs returned have correct size', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body).toHaveLength(helper.listWithMultipleBlogs.length);
});

test('All blogs have the id property', async () => {
  const response = await api.get('/api/blogs');
  response.body.forEach((blog) => expect(blog.id).toBeDefined());
});
