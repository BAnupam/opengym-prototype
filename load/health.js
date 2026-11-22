import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 10,
  thresholds: { http_req_failed: ["rate==0"], http_req_duration: ["p(95)<500"] },
};

export default function healthEndpoint() {
  const response = http.get(`${__ENV.K6_BASE_URL}/api/v1/health`);
  check(response, { "health returns 200": (result) => result.status === 200 });
}
