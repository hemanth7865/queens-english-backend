/**
 * Write the list of the lines here, that wanna convert into array.
 */
const lines = ``;

const result = lines
  .split(/\n/g)
  .map((i) => `'${i}'`)
  .join(",");

console.log(`(${result})`);
