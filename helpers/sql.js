const { BadRequestError } = require("../expressError");

/** Converts raw patch data to parameterized sql query inputs
 *
 * Accepts 2 Arguments:
 *  1.) body data of a patch request - Ex: {firstName: 'Aliya', age: 32}
 *  2.) a schema for converting - Ex: {firstName: 'first_name'}
 * model variable names to SQL field names.
 *
 * Returns the parameterized query version of the data for the SQL query.
 * Ex: { setCols: '"first_name"=$1', values: ['Aliya']}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
