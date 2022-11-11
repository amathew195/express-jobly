"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
// const jobFilterSchema = require("../schemas/jobFilter.json");

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
  // const filters = req.query;
  let jobs = await Job.findAll();

  // // if no query strings are passed in, call findAll()
  // if (Object.keys(filters).length === 0) {
  // } else {
  //   // Convert stringified nums to nums for maxEmployees and minEmployees
  //   if (!isNaN(Number(filters.maxEmployees))) {
  //     filters.maxEmployees = Number(filters.maxEmployees);
  //   }

  //   if (!isNaN(Number(filters.minEmployees))) {
  //     filters.minEmployees = Number(filters.minEmployees);
  //   }

    // Validate query strings against schema
    // const validator = jsonschema.validate(
    //   filters,
    //   jobsFilterSchema,
    //   { required: true }
    // );
    // if (!validator.valid) {
    //   const errs = validator.errors.map(e => e.stack);
    //   throw new BadRequestError(errs);
    // }

    // pass in query object to findFiltered()
    // jobs = await Jobs.findFiltered(filters);
  // }

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






module.exports = router;