"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    "title": "newJob",
    "salary": 100000,
    "equity": 0.05,
    "companyHandle": "c1"
  };

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      "job": {
        "id": 4,
        "title": "newJob",
        "salary": 100000,
        "equity": "0.05",
        "companyHandle": "c1"
      }
    }
    );
  });

  test("fails for non-admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        "salary": 1000,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        "title": "newJob",
        "salary": "one hundred thousand",
        "equity": 0.05,
        "company_handle": "c1"
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET ALL / Jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [
          {
            "id": 1,
            "title": "j1",
            "salary": 10000,
            "equity": "0.05",
            "companyHandle": "c1"
          },
          {
            "id": 2,
            "title": "j2",
            "salary": 50000,
            "equity": "0.025",
            "companyHandle": "c1"
          },
          {
            "id": 3,
            "title": "j3",
            "salary": 100000,
            "equity": "0.075",
            "companyHandle": "c2"
          },
        ],
    });
  });

});

/***************************************GET /jobs FILTERED */

describe("GET /jobs FILTERED", function () {

  test("working with title filter passed in", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({ title: 'j1' });

    expect(resp.body).toEqual({
      jobs:
        [
          {
            "id": 1,
            "title": "j1",
            "salary": 10000,
            "equity": "0.05",
            "companyHandle": "c1"
          }
        ],
    });
  });

  test("working with minSalary filter passed in", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({
        minSalary: "90000",
      });

    expect(resp.body).toEqual({
      jobs:
        [
          {
            "id": 3,
            "title": "j3",
            "salary": 100000,
            "equity": "0.075",
            "companyHandle": "c2"
          }
        ],
    });
  });

  test("working with hasEquity filter passed in", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({
        hasEquity: "true",
      });

    expect(resp.body).toEqual({
      jobs:
        [
          {
            "id": 1,
            "title": "j1",
            "salary": 10000,
            "equity": "0.05",
            "companyHandle": "c1"
          },
          {
            "id": 2,
            "title": "j2",
            "salary": 50000,
            "equity": "0.025",
            "companyHandle": "c1"
          },
          {
            "id": 3,
            "title": "j3",
            "salary": 100000,
            "equity": "0.075",
            "companyHandle": "c2"
          }
        ],
    });
  });

  test("throws error if minSalary is 'abc", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({ minSalary: 'abc' });

    expect(resp.statusCode).toEqual(400);
  });


});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        "id": 1,
        "title": "j1",
        "salary": 10000,
        "equity": "0.05",
        "companyHandle": "c1"
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});


/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        "id": 1,
        "title": "j1-new",
        "salary": 10000,
        "equity": "0.05",
        "companyHandle": "c1"
      },
    });
  });

  test("does not work for non-admin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-new",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        id: 10,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: 1000,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("does not work for non-admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
