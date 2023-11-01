const getDateOutOfDateTime = (date?: any): any => {
  return date ? date.split("T")[0].split(" ")[0] : date;
};

const getRandomNumber = (digits: number = 6) => {
  var text = "";
  var possible = "123456789";
  for (var i = 0; i < digits; i++) {
    var sup = Math.floor(Math.random() * possible.length);
    text += i > 0 && sup === i ? "0" : possible.charAt(sup);
  }
  return text;
};

function csvToArray(str: string, delimiter: string = ",") {
  const headers = str
    .slice(0, str.indexOf("\n"))
    .split(delimiter)
    .map((h) => h.replace("\r", ""));

  const rows = str
    .slice(str.indexOf("\n") + 1)
    .split("\n")
    .map((h) => h.replace("\r", ""));

  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  return arr;
}

export { getDateOutOfDateTime, getRandomNumber, csvToArray };
