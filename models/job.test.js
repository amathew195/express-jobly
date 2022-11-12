
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

  test("bad request with no company_handle", async function () {

    try {
      await Job.create({
        title: "new job",
        salary: 90000,
        equity: 0.05,
        companyHandle: "c0"
      });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err.detail).toEqual(`Key (company_handle)=(c0) is not present in table "companies".`);
    }
  });
});

/******************************************* Get All Jobs */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: 1,
        title: "j1",
        salary: 50000,
        equity: "0.03",
        companyHandle: "c1",
      },
      {
        id: 2,
        title: "j2",
        salary: 90000,
        equity: "0.05",
        companyHandle: "c1",
      },
      {
        id: 3,
        title: "j3",
        salary: 100000,
        equity: "0.01",
        companyHandle: "c2",
      },
    ]);
  });
});

/******************************************* Get Single Jobs */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "j1",
      salary: 50000,
      equity: "0.03",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/******************************************* Find Filtered Jobs */

describe("findFiltered", function () {
  test("works: with title", async function () {
    let jobs = await Job.findFiltered({
      title: 'j1'
    });

    expect(jobs).toEqual([
      {
        id: 1,
        title: "j1",
        salary: 50000,
        equity: "0.03",
        companyHandle: "c1",
      }
    ]);
  });



});

/************************************** _whereClauseGenerator */

describe("_whereClauseGenerator", function () {
  test("works: with title and hasEquity filters", function () {
    let results = Job._whereClauseGenerator({
      title: 'j1',
      hasEquity: true
    });
    expect(results.whereStatement).toEqual(`title ILIKE $1 AND equity > 0.0`);
    expect(results.values).toEqual(["%j1%"]);
  });

  test("works: with title and minSalary filters", function () {
    let results = Job._whereClauseGenerator({
      title: 'j1',
      minSalary: 50000,
    });
    expect(results.whereStatement).toEqual(`title ILIKE $1 AND salary >= $2`);
    expect(results.values).toEqual(["%j1%", 50000]);
  });

  test("works: with minSalary filters", function () {
    let results = Job._whereClauseGenerator({
      minSalary: 50000,
    });
    expect(results.whereStatement).toEqual(`salary >= $1`);
    expect(results.values).toEqual([50000]);
  });

  test("works: with minSalary 0", function () {
    let results = Job._whereClauseGenerator({
      minSalary: 0,
    });
    expect(results.whereStatement).toEqual(`salary >= $1`);
    expect(results.values).toEqual([0]);
  });
});


/******************************************* Update a Job */

describe("update", function () {
  const updateData = {
    title: "J1Updated",
    salary: 100000,
    equity: 0.06,
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      title: "J1Updated",
      salary: 100000,
      equity: "0.06",
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
        FROM jobs
        WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "J1Updated",
      salary: 100000,
      equity: "0.06",
      companyHandle: 'c1'
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      salary: null,
      equity: null,
    };

    let job = await Job.update(2, updateDataSetNulls);
    expect(job).toEqual({
      id: 2,
      title: "j2",
      companyHandle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = 2`);
    expect(result.rows).toEqual([{
      id: 2,
      title: 'j2',
      salary: null,
      equity: null,
      companyHandle: 'c1'
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/******************************************* Delete a Job */

describe("delete", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
      "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});







