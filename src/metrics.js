const config = require("./config");
const os = require("os");

class Metrics {
  constructor(period) {
    this.totalHttpRequests = 0;
    this.GET = 0;
    this.PUT = 0;
    this.POST = 0;
    this.DELETE = 0;
    this.request_duration = 0;

    this.activeUsers = 0;
    this.totalAuthAttempts = 0;
    this.successfulAuthAttempts = 0;
    this.failedAuthAttemps = 0;

    this.numMade = 0;
    this.price = 0;
    this.creation_duration = 0;
    this.failed = 0;

    // function sendMetricsPeriodically(period)
    const timer = setInterval(() => {
      try {
        const buf = new MetricBuilder();
        this.httpMetrics(buf);
        this.systemMetrics(buf);
        this.userMetrics(buf);
        this.purchaseMetrics(buf);
        this.authMetrics(buf);
        const metrics = buf.toString("\n");
        this.sendMetricToGrafana(metrics);
      } catch (error) {
        console.log("Error sending metrics", error);
      }
    }, period);
  }

  track() {
    return (req, res, next) => {
      this.totalHttpRequests++;
      if (req.method == "GET") {
        this.GET++;
      } else if (req.method == "PUT") {
        this.PUT++;
      } else if (req.method == "POST") {
        this.POST++;
      } else if (req.method == "DELETE") {
        this.DELETE++;
      }
      next();
    };
  }

  incrementActiveUsers() {
    this.activeUsers += 1;
  }

  decrementActiveUsers() {
    this.activeUsers -= 1;
  }

  incrementAuthAttempts() {
    this.totalAuthAttempts += 1;
  }

  incrementSuccessfulAuthAttempts() {
    this.successfulAuthAttempts += 1;
  }

  incrementFailedAuthAttempts() {
    this.failedAuthAttemps += 1;
  }

  requestDuration(request_duration) {
    this.request_duration = request_duration;
  }

  trackPurchase(creation_duration, numMade, price, isSuccess) {
    this.creation_duration = creation_duration;
    this.numMade += numMade;
    this.price += price;
    if (!isSuccess) {
      this.failed += 1;
    }
  }

  getCpuUsagePercentage() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    return cpuUsage.toFixed(2) * 100;
  }

  getMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    return memoryUsage.toFixed(2);
  }

  httpMetrics(buf) {
    buf.addMetric(`total`, this.totalHttpRequests);
    buf.addMetric(`get`, this.GET);
    buf.addMetric(`put`, this.PUT);
    buf.addMetric(`post`, this.POST);
    buf.addMetric(`delete`, this.DELETE);
  }

  systemMetrics(buf) {
    buf.addMetric(`cpu`, this.getCpuUsagePercentage());
    buf.addMetric(`memory`, this.getMemoryUsagePercentage());
    buf.addMetric(`request_duration`, this.request_duration);
  }

  userMetrics(buf) {
    buf.addMetric(`active_users`, this.activeUsers);
  }

  purchaseMetrics(buf) {
    buf.addMetric(`pizzas_purchases`, this.sold);
    buf.addMetric(`revenue`, this.price);
    buf.addMetric(`creation_latency`, this.creation_duration);
    buf.addMetric(`creation_failures`, this.failed);
  }

  authMetrics(buf) {
    buf.addMetric(`auth_attempts_total`, this.totalAuthAttempts);
    buf.addMetric(`auth_attempts_successful`, this.successfulAuthAttempts);
    buf.addMetric(`auth_attempts_failed`, this.failedAuthAttemps);
  }

  sendMetricToGrafana(metricName, metricValue, type, unit) {
    const metric = {
      resourceMetrics: [
        {
          scopeMetrics: [
            {
              metrics: [
                {
                  name: metricName,
                  unit: unit,
                  [type]: {
                    dataPoints: [
                      {
                        asInt: metricValue,
                        timeUnixNano: Date.now() * 1000000,
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const body = JSON.stringify(metric);
    fetch(`${config.metrics.url}`, {
      method: "POST",
      body: body,
      headers: {
        Authorization: `Bearer ${config.metrics.apiKey}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          response.text().then((text) => {
            console.error(
              `Failed to push metrics data to Grafana: ${text}\n${body}`
            );
          });
        } else {
          console.log(`Pushed ${metricName}`);
        }
      })
      .catch((error) => {
        console.error("Error pushing metrics:", error);
      });
  }
}

class MetricBuilder {
  constructor() {
    this.metrics = [];
  }

  addMetric(name, value) {
    this.metrics.push(
      `request,source=${config.metrics.source} ${name}=${value}`
    );
  }

  toString(buf) {
    return this.metrics.join(buf);
  }
}

const metrics = new Metrics(1000);
module.exports = metrics;
