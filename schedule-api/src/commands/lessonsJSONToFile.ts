const fs = require("fs");

/**
 * Write the list of the lines here, that wanna convert into array.
 */
const arrayList = [];

const result = arrayList.map((i) => ({
  id: i.id,
  number: i.lessonNumber < 10 ? `0${i.lessonNumber}` : i.lessonNumber,
  type: "lesson",
}));

fs.writeFile("result.txt", JSON.stringify(result), (r) => {
  console.log(result, arrayList.length);
  console.log(r);
});
