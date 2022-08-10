const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const api = supertest(app);

const Blog = require('../models/blog');
const User = require('../models/user');
const { response } = require('../app');

let token;
beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const blogObjects = helper.listWithMultipleBlogs.map(
    (blog) => new Blog(blog)
  );

  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);

  await api
    .post('/api/users')
    .send(helper.userCreation)
    .set('Accept', 'application/json');

  token = (
    await api
      .post('/api/login')
      .send(helper.user)
      .set('Accept', 'application/json')
  ).body.token;
});

test('Blogs returned have the correct size', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body).toHaveLength(helper.listWithMultipleBlogs.length);
});

test('All blogs have the id property', async () => {
  const response = await api.get('/api/blogs');
  response.body.forEach((blog) => expect(blog.id).toBeDefined());
});

describe('Adding new blogs', () => {
  test('New blog created is successfully', async () => {
    const newBlog = {
      title: 'Top 10 anime betrayals.',
      author: 'Ruka Inaba',
      url: 'http://kissanime.com.jp',
      likes: 113,
    };
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ Accept: 'application/json', Authorization: `bearer ${token}` })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const updatedBlogList = (
      await api.get('/api/blogs').set('Authorization', `bearer ${token}`)
    ).body;
    expect(updatedBlogList).toHaveLength(
      helper.listWithMultipleBlogs.length + 1
    );

    const titles = updatedBlogList.map((blog) => blog.title);
    expect(titles).toContain('Top 10 anime betrayals.');
  });

  test('Likes default to zero if likes property missing', async () => {
    const blog = {
      ...helper.listWithOneBlog[0],
    };
    delete blog.likes;

    const response = await api
      .post('/api/blogs')
      .send(blog)
      .set({ Accept: 'application/json', Authorization: `bearer ${token}` })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(response.body.likes).toBe(0);
  });

  test('Bad request is returned if title or url is missing', async () => {
    const blog = {
      ...helper.listWithOneBlog[0],
    };
    delete blog.title;
    delete blog.url;

    await api
      .post('/api/blogs')
      .send(blog)
      .set({ Accept: 'application/json', Authorization: `bearer ${token}` })
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('Status code 401 is returned if no token provided', async () => {
    await api.get('/api/blogs').expect(401);
  });
});

describe('Deleting blogs', () => {
  test('Deletes blog successfully', async () => {
    const response = await api.get('/api/blogs');

    const id = response.body[0].id;

    await api.delete(`/api/blogs/${id}`).expect(204);

    const responseAfterDel = await api.get('/api/blogs');

    const ids = responseAfterDel.body.map((blog) => blog.id);

    expect(ids).not.toContain(id);
  });

  test('Deleting non-existent blog returns 400', async () => {
    await api.delete(`/api/blogs/wrongId`).expect(400);
  });

  test('Missing id parameter returns 404', async () => {
    await api.delete(`/api/blogs/`).expect(404);
  });
});

describe('Updating blogs', () => {
  test('Update successful', async () => {
    const blogs = (await api.get('/api/blogs')).body;
    const blog = blogs[0];
    const toUpdate = {
      title: 'Top 10 anime betrayals',
    };
    const updatedBlog = {
      ...blog,
      title: 'Top 10 anime betrayals',
    };

    const response = await api
      .put(`/api/blogs/${blog.id}`)
      .send(toUpdate)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual(updatedBlog);
  });

  test('Updating non-existent properties return original blog', async () => {
    const blogs = (await api.get('/api/blogs')).body;
    const blog = blogs[0];
    const toUpdate = {
      titles: 'Nonsense',
      irl: 'www.wrong.com',
    };

    const response = await api
      .put(`/api/blogs/${blog.id}`)
      .send(toUpdate)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual(blog);
  });

  test('Updating non-existent blog returns 400', async () => {
    await api.delete(`/api/blogs/wrongId`).expect(400);
  });

  test('Missing id parameter returns 404', async () => {
    await api.delete(`/api/blogs/`).expect(404);
  });
});
