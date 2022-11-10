"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { id, title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle  }
   *
   * */

   static async create({ title, salary, equity, companyHandle }) {

    console.log("We got into the method...........")

    const result = await db.query(
      `INSERT INTO jobs(
        title,
        salary,
        equity,
        company_handle)
           VALUES
             ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [
        title,
        salary,
        equity,
        companyHandle
      ],
    );
    const job = result.rows[0];

    return job;
  }





}

module.exports = Job;