export const generatePagiantionAndConditions = (
  parameters
): {
  current: number;
  limit: number;
  offsetRecords: number;
  whereCondition: string[];
  condition: string;
} => {
  const current = parameters.current ? parseInt(parameters.current) : 0;
  const limit = parameters.pageSize ? parseInt(parameters.pageSize) : 0;
  const offsetRecords = (current - 1) * limit;

  const whereCondition: string[] = [];
  whereCondition.push(" 1 = 1 ");
  for (let param in parameters) {
    if (parameters[param].length < 1) {
      continue;
    }

    if (["current", "pageSize"].includes(param)) {
      continue;
    }
    if ([].includes(param)) {
      // custom operators
    } else {
      whereCondition.push(`${param} LIKE '%${parameters[param]}%'`);
    }
  }

  const condition =
    whereCondition.length > 1
      ? whereCondition.join(" and ")
      : whereCondition.toString();

  return { current, limit, offsetRecords, whereCondition, condition };
};
