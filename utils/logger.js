const info = (...params) => {
  console.log(...params);
};

const error = (...params) => {
  console.error(...params);
};

modules.exports = { info, error };
