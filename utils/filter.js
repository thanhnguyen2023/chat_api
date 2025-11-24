// utils/filter.js
const Filter = require("bad-words");
const filter = new Filter();

// Thêm từ bậy
filter.addWords("dm", "đm", "vcl", "clm", "lồn", "cặc", "địt", "vl", "vãi");

// Hàm cleanText
function cleanText(text) {
  return filter.clean(text);
}

// Export
module.exports = { cleanText };
