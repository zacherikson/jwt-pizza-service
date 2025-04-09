# Curiosity Report: Site Reliability Engineering (SRE)

## Why I Chose This Topic

After going through this class, I am curious to see how SRE is practiced at Google, and if it is different from what we've learned about DevOps.

## What I Learned

SRE is a discipline that incorporates software engineering principles into IT operations and infrastructure management. It was pioneered by Google to help scale systems reliably while releasing new features rapidly. The main difference between SRE and DevOps is that SRE is more focused on the reliability/stability of the system. DevOps is more focused on the speed of the end-to-end development process. They both focus on collaboration, automation, and improving the deployment process.

- **Service Level Objectives (SLOs)**, **Service Level Indicators (SLIs)**, and **Error Budgets** are core to how SRE teams manage reliability.

  - _SLO_: A target level for system reliability (e.g., 99.9% uptime).
  - _SLI_: A metric to measure service health (e.g., latency, error rate).
  - _Error Budget_: The permissible margin of error in a given period, allowing developers to innovate without compromising reliability too much.

- **Eliminating toil**: SREs aim to minimize "toil" — repetitive, manual, and automatable tasks — so they can focus on higher-impact work.

- **Learning from failure**: One of the most powerful ideas is fostering a culture where failures are learning opportunities rather than reasons for punishment. SRE teams are encouraged to write postmortems that are blame-free and focused on learning.

## Surprising Facts

- At Google, the SRE team is given the power to _deny_ launches if a service is too unreliable or likely to exceed its error budget.

- SREs often write as much code as product developers — sometimes more — but their code focuses on reliability, automation, monitoring, and scalability.

- The first SRE team was founded in 2003 at Google. Since then, the field has grown so much that entire books, certifications, and conferences are now dedicated to it.

---
