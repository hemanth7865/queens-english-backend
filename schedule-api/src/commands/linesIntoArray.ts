const fs = require("fs");

/**
 * Write the list of the lines here, that wanna convert into array.
 */
const lines = ``;

const result = lines.split(/\n/g);

fs.writeFile("result.txt", JSON.stringify(result), (r) => {
  console.log(result, result.length);
  console.log(r);
});
