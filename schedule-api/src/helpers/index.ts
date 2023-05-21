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

export { getDateOutOfDateTime, getRandomNumber };
