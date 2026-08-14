import api from "./api";

// Public newsletter signup. Backend upserts on email — subscribing again with
// the same email just flips `subscribed` back to true rather than erroring,
// so it's safe to call this more than once for the same person.
// Body accepts either { name, email } or { donorName, donorEmail } — using
// the shorter public-facing keys here.
export const subscribeToNewsletter = ({ name, email }) =>
  api.post("/public/subscribers/subscribe", { name, email });