"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobFilterSchema = require("../schemas/jobFilter.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: must be logged in and an admin
 */

 router.post("/", ensureIsAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    jobNewSchema,
    { required: true }
  );

  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }
  const job = await Job.create(req.body);

  return res.status(201).json({ job });
});

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, company_handle }, ...] }
 *
 * Authorization required: none
 */

 router.get("/", async function (req, res, next) {
  const filters = req.query;
  let jobs;

  // if no query strings are passed in, call findAll()
  if (Object.keys(filters).length === 0) {
    jobs = await Job.findAll();
  } else {
    // Convert stringified nums to nums for minSalary
    if (!isNaN(filters.minSalary)) {
      filters.minSalary = Number(filters.minSalary);
    }

    if (filters.hasEquity === "true") {
      filters.hasEquity = true;
    }


    //Validate query strings against schema
    const validator = jsonschema.validate(
      filters,
      jobFilterSchema,
      { required: true }
    );
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    //pass in query object to findFiltered()
    jobs = await Job.findFiltered(filters);
  }

    return res.json({ jobs });
});

/** GET /[id]  =>  { job }
 *
 *  Job is {  id, title, salary, equity, company_handle }
 *
 * Authorization required: none
 */

 router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns {  id, title, salary, equity, company_handle }
 *
 * Authorization required: must be logged in and an admin
 */

 router.patch("/:id", ensureIsAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    jobUpdateSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: must be logged in and an admin
 */

 router.delete("/:id", ensureIsAdmin, async function (req, res, next) {
  await Job.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});



module.exports = router;