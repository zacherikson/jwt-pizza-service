const config = require("./config");
const os = require("os");

class Metrics {
  constructor() {
    this.requests = {};
    this.request_duration = 0;

    this.activeUsers = 0;
    this.totalAuthAttempts = 0;
    this.successfulAuthAttempts = 0;
    this.failedAuthAttempts = 0;

    this.numMade = 0;
    this.price = 0;
    this.creationDuration = 0;
    this.failed = 0;
  }

  requestTracker() {
    return (req, res, next) => {
      const endpoint = req.method;
      this.requests[endpoint] = (this.requests[endpoint] || 0) + 1;
      next();
    };
  }

  getCpuUsagePercentage() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    return cpuUsage.toFixed(2) * 100;
  }

  getMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const usedMemory = totalMemory - os.freemem();
    const memoryUsage = (usedMemory / totalMemory) * 100;
    return parseFloat(memoryUsage.toFixed(2));
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
    this.failedAuthAttempts += 1;
  }

  requestDuration(duration) {
    this.request_duration = duration;
  }

  trackPurchase(creationDuration, numMade, price, isSuccess) {
    this.creationDuration = creationDuration;
    this.numMade += numMade;
    this.price += price;
    if (!isSuccess) this.failed += 1;
  }

  httpMetrics(buf) {
    buf.addMetric(
      "total",
      Object.values(this.requests).reduce((a, b) => a + b, 0),
      "1",
      "sum"
    );
    ["GET", "PUT", "POST", "DELETE"].forEach((method) => {
      buf.addMetric(
        method.toLowerCase(),
        this.requests[method] || 0,
        "1",
        "sum"
      );
    });
  }

  systemMetrics(buf) {
    buf.addMetric("cpu", this.getCpuUsagePercentage(), "%", "gauge");
    buf.addMetric("memory", this.getMemoryUsagePercentage(), "%", "gauge");
    buf.addMetric("request_duration", this.request_duration, "ms", "sum");
  }

  userMetrics(buf) {
    buf.addMetric("active_users", this.activeUsers, "1", "sum");
  }

  purchaseMetrics(buf) {
    buf.addMetric("pizzas_purchases", this.numMade, "1", "sum");
    buf.addMetric("revenue", this.price, "1", "sum");
    buf.addMetric("creation_latency", this.creationDuration, "ms", "sum");
    buf.addMetric("creation_failures", this.failed, "1", "sum");
  }

  authMetrics(buf) {
    buf.addMetric("auth_attempts_total", this.totalAuthAttempts, "1", "sum");
    buf.addMetric(
      "auth_attempts_successful",
      this.successfulAuthAttempts,
      "1",
      "sum"
    );
    buf.addMetric("auth_attempts_failed", this.failedAuthAttempts, "1", "sum");
  }

  sendMetricToGrafana(metrics) {
    fetch(`${config.metrics.url}`, {
      method: "POST",
      body: JSON.stringify(metrics),
      headers: {
        Authorization: `Bearer ${config.metrics.apiKey}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Failed to push metrics data to Grafana");
          console.log(response);
        } else console.log(`Pushed metrics`);
      })
      .catch((error) => console.error("Error pushing metrics:", error));
  }

  sendMetricsPeriodically(period) {
    setInterval(() => {
      try {
        const buf = new MetricBuilder();
        this.httpMetrics(buf);
        this.systemMetrics(buf);
        this.userMetrics(buf);
        this.purchaseMetrics(buf);
        this.authMetrics(buf);

        this.sendMetricToGrafana(buf.metrics);
      } catch (error) {
        console.error("Error sending metrics", error);
      }
    }, period);
  }
}

class MetricBuilder {
  constructor() {
    this.metrics = {
      resourceMetrics: [
        {
          scopeMetrics: [
            {
              metrics: [],
            },
          ],
        },
      ],
    };
  }

  addMetric(metricName, metricValue, metricUnit, type) {
    const metric = {
      name: metricName,
      unit: metricUnit,
      [type]: {
        dataPoints: [
          {
            asDouble: metricValue,
            timeUnixNano: Date.now() * 1000000,
            attributes: [
              {
                key: "source",
                value: { stringValue: config.metrics.source },
              },
            ],
          },
        ],
      },
    };

    if (type === "sum") {
      metric[type].aggregationTemporality =
        "AGGREGATION_TEMPORALITY_CUMULATIVE";
      metric[type].isMonotonic = true;
    }

    this.metrics.resourceMetrics[0].scopeMetrics[0].metrics.push(metric);
  }

  toString(separator) {
    return this.metrics.join(separator);
  }
}

const metrics = new Metrics();
metrics.sendMetricsPeriodically(1000);

module.exports = metrics;
