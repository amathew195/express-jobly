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

   static async create({ title, salary, equity, company_handle }) {

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
        company_handle
      ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */

   static async findAll() {
    const jobsRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
           FROM jobs
           ORDER BY id`);
    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

   static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
      [id]);

    const job = jobRes.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Function MUST be passed filters object.
  * Finds specific jobs based on input object of filters.
 *  Param is object with possible keys {id, title, salary, equity, company_handle}
 * Returns [{ id, title, salary, equity, companyHandle }, ...]
 * */

     static async findFiltered(filters) {

      const { whereStatement, values } = Job._whereClauseGenerator(filters);

      const jobsRes = await db.query(
          `SELECT id,
          title,
          salary AS "minSalary",
          equity AS "hasEquity",
          company_handle AS "companyHandle"
        FROM jobs
        WHERE ${whereStatement}
        ORDER BY id`, values);

      return jobsRes.rows;
    }

     /** Given a filters object, return an object containing the WHERE clause
   * and filter values. This is a helper function for findFiltered.
   *
   * Returns { whereStatement, values }
   *   where whereStatement is a string (ex. "name ILIKE ....")
   *   values is an array containing filter values (ex. ["garner", 500])
   **/

  static _whereClauseGenerator(filters) {

    const whereQueries = [];
    const values = [];

    if (filters.title) {
      values.push(`%${filters.title}%`);
      whereQueries.push(`title ILIKE $${values.length}`);
    }
    if (filters.minSalary) {
      values.push(filters.minSalary);
      whereQueries.push(`salary >= $${values.length}`);
    }

    if (filters.hasEquity === true) {
      whereQueries.push(`equity > 0.0`);
    }

    const whereStatement = whereQueries.join(' AND ');

    return { whereStatement, values };

  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

   static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle",
      });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

     static async remove(id) {
      const result = await db.query(
        `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
        [id]);
      const job = result.rows[0];

      if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;