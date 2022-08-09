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

test('Blogs returned have the correct size', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body).toHaveLength(helper.listWithMultipleBlogs.length);
});

test('All blogs have the id property', async () => {
  const response = await api.get('/api/blogs');
  response.body.forEach((blog) => expect(blog.id).toBeDefined());
});

test('New blog created is successfully', async () => {
  const newBlog = {
    title: 'Top 10 anime betrayals.',
    author: 'Ruka Inaba',
    url: 'http://kissanime.com.jp',
    likes: 113,
  };

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Accept', 'application/json')
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const updatedBlogList = (await api.get('/api/blogs')).body;
  expect(updatedBlogList).toHaveLength(helper.listWithMultipleBlogs.length + 1);

  const titles = updatedBlogList.map((blog) => blog.title);
  expect(titles).toContain('Top 10 anime betrayals.');
});
