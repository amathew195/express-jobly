
"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/*********************** End Setup ******************/


/******************************************* Create Job */

describe("create", function () {

  const newJob = {
    title: "new job",
    salary: 90000,
    equity: 0.05,
    companyHandle: 'c1'
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(
      {
        id: 4,
        title: "new job",
        salary: 90000,
        equity: '0.05',
        companyHandle: 'c1'
      }
    );

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 4`);
    expect(result.rows).toEqual([
      {
        id: 4,
        title: 'new job',
        salary: 90000,
        equity: '0.05',
        company_handle: 'c1'
      }

    ]);
  });

});

/******************************************* Get All Jobs */




/******************************************* Get Single Jobs */






/******************************************* Find Filtered Jobs */




/******************************************* Update a Job */


/******************************************* Delete a Job */









