import { sleep, check, group, fail } from "k6";
import http from "k6/http";
import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";

export const options = {
  cloud: {
    distribution: {
      "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
    },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 5, duration: "30s" },
        { target: 15, duration: "1m" },
        { target: 10, duration: "30s" },
        { target: 0, duration: "30s" },
      ],
      gracefulRampDown: "30s",
      exec: "scenario_1",
    },
  },
};

// Scenario: Scenario_1 (executor: ramping-vus)

export function scenario_1() {
  let response;

  const vars = {};

  group("login and order - https://pizza.zacherikson329.click/", function () {
    // Homepage
    response = http.get("https://pizza.zacherikson329.click/", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9,es;q=0.8",
        "cache-control": "max-age=0",
        "if-modified-since": "Mon, 10 Mar 2025 20:41:58 GMT",
        "if-none-match": '"d34413e1641d1d9ac506c63677c68acf"',
        priority: "u=0, i",
        "sec-ch-ua":
          '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
      },
    });
    sleep(13);

    // Login
    response = http.put(
      "https://pizza-service.zacherikson329.click/api/auth",
      '{"email":"d@jwt.com","password":"diner"}',
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9,es;q=0.8",
          "content-type": "application/json",
          origin: "https://pizza.zacherikson329.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
        },
      }
    );
    if (
      !check(response, {
        "status equals 200": (response) => response.status.toString() === "200",
      })
    ) {
      console.log(response.body);
      fail("Login was *not* 200");
    }
    vars["token1"] = jsonpath.query(response.json(), "$.token")[0];

    sleep(4.7);

    // Get Menu
    response = http.get(
      "https://pizza-service.zacherikson329.click/api/order/menu",
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9,es;q=0.8",
          authorization: `Bearer ${vars["token1"]}`,
          "content-type": "application/json",
          "if-none-match": 'W/"1fc-cgG/aqJmHhElGCplQPSmgl2Gwk0"',
          origin: "https://pizza.zacherikson329.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
        },
      }
    );
    sleep(0.5);

    // Get Franchise
    response = http.get(
      "https://pizza-service.zacherikson329.click/api/franchise",
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9,es;q=0.8",
          authorization: `Bearer ${vars["token1"]}`,
          "content-type": "application/json",
          "if-none-match": 'W/"40-EPPawbPn0KtYVCL5qBynMCqA1xo"',
          origin: "https://pizza.zacherikson329.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
        },
      }
    );
    sleep(6.7);

    // Purchase pizza
    response = http.post(
      "https://pizza-service.zacherikson329.click/api/order",
      '{"items":[{"menuId":2,"description":"Pepperoni","price":0.0042}],"storeId":"1","franchiseId":1}',
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9,es;q=0.8",
          authorization: `Bearer ${vars["token1"]}`,
          "content-type": "application/json",
          origin: "https://pizza.zacherikson329.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
        },
      }
    );
    if (
      !check(response, {
        "status equals 200": (response) => response.status.toString() === "200",
      })
    ) {
      console.log(response.body);
      fail("Login was *not* 200");
    }
    vars["jwt1"] = jsonpath.query(response.json(), "$.jwt")[0];

    // Verify pizza
    response = http.post(
      "https://pizza-factory.cs329.click/api/order/verify",
      JSON.stringify({ jwt: vars["jwt1"] }),
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9,es;q=0.8",
          authorization: `Bearer ${vars["token1"]}`,
          "content-type": "application/json",
          origin: "https://pizza.zacherikson329.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
        },
      }
    );
  });
}
