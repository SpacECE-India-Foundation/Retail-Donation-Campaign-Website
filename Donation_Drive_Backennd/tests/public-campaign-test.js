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
// export const options = {
//     stages: [
//         { duration: "20s", target: 10 },
//         { duration: "20s", target: 25 },
//         { duration: "20s", target: 50 },
//         { duration: "20s", target: 100 },
//         { duration: "20s", target: 250 },
//         { duration: "20s", target: 500 },
//         { duration: "20s", target: 0 },
//     ],
//     thresholds: {
//         http_req_failed: ["rate<0.01"],
//         http_req_duration: ["p(95)<500"],
//     },
// };

export default function () {
    const res = http.get("http://localhost:3002/api/campaigns/");

    check(res, {
        "Status is 200": (r) => r.status === 200,
    });
}