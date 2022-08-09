const listHelper = require('../utils/list_helper');
const helper = require('./test_helper');

test('dummy returns one', () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe('total likes', () => {
  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(helper.listWithOneBlog);
    expect(result).toBe(5);
  });

  test('list with multiple blogs', () => {
    const result = listHelper.totalLikes(helper.listWithMultipleBlogs);
    expect(result).toBe(36);
  });

  test('empty list of blogs', () => {
    const result = listHelper.totalLikes([]);
    expect(result).toBe(0);
  });
});

describe('favourite blog', () => {
  test('when list has one blog, return that one blog', () => {
    const result = listHelper.favoriteBlog(helper.listWithOneBlog);
    expect(result).toEqual(helper.listWithOneBlog[0]);
  });

  test('list with multiple blogs', () => {
    const result = listHelper.favoriteBlog(helper.listWithMultipleBlogs);
    expect(result).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    });
  });

  test('if list of blogs is empty, return null', () => {
    const result = listHelper.favoriteBlog([]);
    expect(result).toEqual(null);
  });
});
