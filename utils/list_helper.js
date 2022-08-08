const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes;
  };

  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  let favourite = null;
  blogs.forEach((blog) => {
    if (!favourite) {
      favourite = blog;
    } else {
      favourite = favourite.likes > blog.likes ? favourite : blog;
    }
  });

  return favourite;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
