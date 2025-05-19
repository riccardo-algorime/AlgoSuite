# Phase 4.2: Parallel Running – Proxy, Feature Flags, Shadow Testing, and Monitoring

This document provides a detailed, actionable plan for Phase 4.2 of the FastAPI to NestJS migration: running both systems in parallel to ensure a safe, controlled transition. The goal is to minimize risk by validating the new NestJS backend under real-world conditions before full cutover.

---

## Overview

**Phase 4.2 Objectives:**
- Route production traffic to both FastAPI and NestJS backends in parallel.
- Enable gradual rollout and easy rollback using feature flags and traffic splitting.
- Perform shadow testing to compare system behavior and catch discrepancies.
- Monitor both systems closely for errors, performance, and health.

---

## 1. Set Up Proxy for Traffic Routing and Splitting

### 1.1. Select and Configure a Proxy Solution

**Recommended Tools:**
- [NGINX](https://nginx.org/en/docs/): Flexible, widely used reverse proxy.
- [Envoy Proxy](https://www.envoyproxy.io/): Advanced L7 proxy with traffic splitting and observability.
- [AWS API Gateway](https://docs.aws.amazon.com/apigateway/): If using AWS, supports canary deployments and traffic shifting.

**Action Steps:**
1. **Deploy the proxy** in front of both FastAPI and NestJS backends.
2. **Configure routing rules**:
   - Default: Route all traffic to FastAPI.
   - For selected endpoints or users, route to NestJS (for canary/gradual rollout).
   - Enable header/cookie-based routing for feature flag support.
3. **Enable traffic splitting**:
   - Start with 0% to NestJS, gradually increase (e.g., 5%, 10%, 25%, 50%, 100%).
   - Use weighted round-robin or similar algorithms.
4. **Implement failover**:
   - If NestJS returns errors or is unavailable, automatically route requests to FastAPI.
   - Monitor backend health and update routing dynamically.

**References:**
- See [docs/build_process.md](build_process.md) for deployment details.
- See [docs/module_organization.md](module_organization.md) for service structure.

---

## 2. Implement Feature Flags for Gradual Rollout

### 2.1. Choose a Feature Flag System

**Options:**
- [Unleash](https://www.getunleash.io/): Open-source, self-hosted.
- [LaunchDarkly](https://launchdarkly.com/): SaaS, advanced targeting.
- [ConfigCat](https://configcat.com/): SaaS, simple API.
- Custom implementation using environment variables or config files.

**Action Steps:**
1. **Integrate feature flag SDK** into both FastAPI and NestJS backends.
2. **Define flags** for:
   - Routing (e.g., `use_nestjs_backend`)
   - Endpoint-level toggles
   - User/tenant targeting
3. **Configure gradual rollout**:
   - Enable for internal users first.
   - Expand to a percentage of real users.
   - Monitor impact before full rollout.
4. **Document feature flag usage**:
   - Add to [docs/configuration_options.md](configuration_options.md) and code comments.

---

## 3. Shadow Testing: Duplicate and Compare Requests

### 3.1. Set Up Shadow Traffic

**Purpose:** Send a copy of production requests to NestJS while FastAPI handles the real response. Compare outputs to detect regressions.

**Action Steps:**
1. **Configure proxy** to duplicate incoming requests:
   - Main request goes to FastAPI (user receives this response).
   - Shadow request goes to NestJS (response is logged, not returned to user).
2. **Log and compare responses**:
   - Store both FastAPI and NestJS responses for the same request.
   - Automate comparison (status codes, payloads, error messages).
   - Flag and investigate discrepancies.
3. **Monitor shadow traffic**:
   - Track error rates, mismatches, and performance metrics.
   - Use dashboards and alerts for anomalies.

**Tools:**
- NGINX with [mirror module](https://nginx.org/en/docs/http/ngx_http_mirror_module.html)
- Envoy [shadowing](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/shadowing)
- Custom middleware if needed

**Documentation:**
- Record findings in a dedicated log/report (e.g., `docs/shadow_testing_results.md`).

---

## 4. Monitoring, Alerts, and Health Checks

### 4.1. Monitoring Setup

**Key Metrics:**
- Error rates (4xx, 5xx)
- Latency and response times
- Throughput (requests per second)
- Resource usage (CPU, memory)
- Health check endpoints

**Recommended Tools:**
- [Prometheus](https://prometheus.io/) + [Grafana](https://grafana.com/): Metrics and dashboards.
- [Sentry](https://sentry.io/): Error tracking.
- [New Relic](https://newrelic.com/), [Datadog](https://www.datadoghq.com/): Full-stack monitoring (if available).

**Action Steps:**
1. **Instrument both backends** with metrics and error reporting.
2. **Set up dashboards** to visualize key metrics for both FastAPI and NestJS.
3. **Configure alerts** for:
   - High error rates
   - Increased latency
   - Backend unavailability
4. **Implement health checks**:
   - Ensure `/health` endpoints are available and monitored.
   - Proxy should use health checks for routing/failover decisions.
5. **Document monitoring setup**:
   - Add to [docs/logging_and_monitoring_strategy.md](logging_and_monitoring_strategy.md)
   - Include dashboard screenshots and alert policies.

---

## 5. Documentation and Knowledge Sharing

- Document all proxy, feature flag, shadow testing, and monitoring configurations.
- Update [docs/plan.md](plan.md) and [docs/tasks.md](tasks.md) with progress and decisions.
- Record lessons learned and issues found during parallel running in [docs/work_log.md](work_log.md).

---

## References and Further Reading

- [Blue-Green Deployments](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [Canary Releases](https://martinfowler.com/bliki/CanaryRelease.html)
- [Shadow Testing Patterns](https://blog.envoyproxy.io/shadow-testing-with-envoy-6c7e6c1c7b6b)
- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)
- [NGINX Traffic Splitting](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/#traffic-splitting)
- [Envoy Traffic Shadowing](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/shadowing)

---

## Checklist

- [ ] Proxy deployed and routing rules configured
- [ ] Feature flag system integrated and rollout plan defined
- [ ] Shadow testing enabled and discrepancies logged
- [ ] Monitoring and alerting set up for both backends
- [ ] Documentation updated for all changes

---

**Next Steps:**  
Begin implementation of proxy and feature flag system, followed by shadow testing and monitoring setup. Use this plan as a step-by-step guide and update documentation as progress is made.
