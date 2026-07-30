import http from "k6/http";
import { check } from "k6";

export const options = {
    vus: 250,
    duration: "30s",

    thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<300"],
    },
};

export default function () {

    const res = http.get(
        "http://localhost:3002/api/campaigns/6a5dfaa30bc988cc6e008b72"
    );

    check(res, {
        "Status is 200": (r) => r.status === 200,
    });
}