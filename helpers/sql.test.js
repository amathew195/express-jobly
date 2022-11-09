const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");



describe("sqlForPartialUpdate", function () {
  test("works", function () {
    const dataToUpdate = { firstName: 'Aliya', lastName: 'Sanders' };
    const jsToSql = { firstName: 'first_name', lastName: 'last_name' };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(result).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2',
      values: ['Aliya', 'Sanders']
    });
  });

  test("invalid, no data", function () {
    const dataToUpdate = {};
    const jsToSql = { firstName: 'first_name', lastName: 'last_name' };

    expect(() => { sqlForPartialUpdate(dataToUpdate, jsToSql); })
      .toThrow(BadRequestError);
  });
});