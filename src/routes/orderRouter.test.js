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

test("get menu", async () => {
  const res = await request(app).get("/api/order/menu").send(testUser);

  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({});
});

test("put item on menu", async () => {
  const item = {
    title: "Student",
    description: "No topping, no sauce, just carbs",
    image: "pizza9.png",
    price: 0.0001,
  };
  const res = await request(app)
    .put("/api/order/menu")
    .set("Authorization", `Bearer ${loginAdminRes.body.token}`)
    .send(item);

  expect(res.status).toBe(200);
  expect(res.body.at(-1)).toMatchObject(item);
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
