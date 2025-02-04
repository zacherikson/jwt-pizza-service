const request = require("supertest");
const app = require("../service");
const { Role, DB } = require("../database/database.js");

let admins = [];
const testUser = { name: "pizza diner", email: "reg@test.com", password: "a" };
let testUserAuthToken;
let registerRes;
let loginAdminRes;

beforeAll(async () => {
  const adminUser = await createAdminUser();
  admins.push(adminUser);
  loginAdminRes = await request(app).put("/api/auth").send(adminUser);

  testUser.email = Math.random().toString(36).substring(2, 12) + "@test.com";
  registerRes = await request(app).post("/api/auth").send(testUser);
  testUserAuthToken = registerRes.body.token;
  expectValidJwt(testUserAuthToken);
});

test("get franchises", async () => {
  const res = await request(app).get("/api/franchise").send(admins[0]);

  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({});
});

test("get user's franchises", async () => {
  const res = await request(app)
    .get(`/api/franchise/${registerRes.body.user.id}`)
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`);

  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({});
});

test("create a franchise", async () => {
  const franchiseName = randomName();
  const franchise = { name: franchiseName, admins: [admins[0]] };

  const res = await request(app)
    .post("/api/franchise")
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`)
    .send(franchise);

  expect(res.status).toBe(200);
  expect(res.body.name).toBe(franchiseName);
  expect(res.body.admins[0].email).toBe(admins[0].email);
});

test("create a store", async () => {
  const franchiseName = randomName();
  const franchise = { name: franchiseName, admins: [admins[0]] };

  const createRes = await request(app)
    .post("/api/franchise")
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`)
    .send(franchise);

  const storeName = randomName();
  const store = { name: storeName, franchise: createRes.body.id };

  const res = await request(app)
    .post(`/api/franchise/${createRes.body.id}/store`)
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`)
    .send(store);

  expect(res.status).toBe(200);
  expect(res.body.name).toBe(storeName);
});

test("delete a franchise", async () => {
  const franchiseName = randomName();
  const franchise = { name: franchiseName, admins: [admins[0]] };

  const createRes = await request(app)
    .post("/api/franchise")
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`)
    .send(franchise);

  const res = await request(app)
    .delete(`/api/franchise/${createRes.body.id}`)
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`)
    .send(franchise);

  expect(res.status).toBe(200);
  expect(res.body.message).toBe("franchise deleted");
});

test("delete a store", async () => {
  const franchiseName = randomName();
  const franchise = { name: franchiseName, admins: [admins[0]] };

  const createFranchiseRes = await request(app)
    .post("/api/franchise")
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`)
    .send(franchise);

  const storeName = randomName();
  const store = { name: storeName, franchise: createFranchiseRes.body.id };

  const createStoreRes = await request(app)
    .post(`/api/franchise/${createFranchiseRes.body.id}/store`)
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`)
    .send(store);

  const res = await request(app)
    .delete(
      `/api/franchise/${createFranchiseRes.body.id}/store/${createStoreRes.body.id}`
    )
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`)
    .send(store);

  expect(res.status).toBe(200);
});

function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(
    /^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/
  );
}

async function createAdminUser() {
  let user = { password: "toomanysecrets", roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + "@admin.com";

  user = await DB.addUser(user);
  return { ...user, password: "toomanysecrets" };
}

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}
