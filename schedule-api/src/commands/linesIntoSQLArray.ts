const fs = require("fs");

/**
 * Write the list of the lines here, that wanna convert into array.
 */
const lines = ``;

const arrayList = [...new Set(lines.split(/\n/g))];

const result = arrayList.map((i) => `'${i}'`).join(",");

fs.writeFile("result.txt", `(${result})`, (r) => {
  console.log(`(${result})`, arrayList.length);
  console.log(r);
});
