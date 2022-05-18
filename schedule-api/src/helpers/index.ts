const getDateOutOfDateTime = (date?: any): any => {
  return date ? date.split("T")[0].split(" ")[0] : date;
};

export { getDateOutOfDateTime };
