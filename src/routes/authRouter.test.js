const request = require("supertest");
const app = require("../service");
const { Role, DB } = require("../database/database.js");

const testUser = { name: "pizza diner", email: "reg@test.com", password: "a" };
let testUserAuthToken;
let registerRes;

beforeAll(async () => {
  const adminUser = await createAdminUser();
  loginAdminRes = await request(app).put("/api/auth").send(adminUser);

  testUser.email = Math.random().toString(36).substring(2, 12) + "@test.com";
  registerRes = await request(app).post("/api/auth").send(testUser);
  testUserAuthToken = registerRes.body.token;
  expectValidJwt(testUserAuthToken);
});

test("login", async () => {
  const loginRes = await request(app).put("/api/auth").send(testUser);
  expect(loginRes.status).toBe(200);
  expectValidJwt(loginRes.body.token);

  const expectedUser = { ...testUser, roles: [{ role: "diner" }] };
  delete expectedUser.password;
  expect(loginRes.body.user).toMatchObject(expectedUser);
});

test("logout", async () => {
  const loginRes = await request(app).put("/api/auth").send(testUser);
  const logoutRes = await request(app)
    .delete("/api/auth")
    .set("Authorization", `Bearer ${testUserAuthToken}`)
    .send(testUser);

  const expectedResponse = { message: "logout successful" };
  expect(logoutRes.body.message).toBe(expectedResponse.message);
});

test("update user", async () => {
  const updatedUser = {
    id: registerRes.body.user.id,
    email: testUser.email,
    password: "b",
  };

  const updateUserRes = await request(app)
    .put(`/api/auth/${updatedUser.id}`)
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`)
    .send(updatedUser);

  expect(updateUserRes.status).toBe(200);
  expect(updateUserRes.body.email).toBe(updatedUser.email);
});

function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(
    /^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/
  );
}

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

async function createAdminUser() {
  let user = { password: "toomanysecrets", roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + "@admin.com";

  user = await DB.addUser(user);
  return { ...user, password: "toomanysecrets" };
}
