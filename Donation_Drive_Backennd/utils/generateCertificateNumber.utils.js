//this is the utility function for the generation of the certificate number
import { customAlphabet } from "nanoid";

// This utility function generates a human-readable public certificate number
// Example: SPC-2026-H7K9P4Q2
const nanoid = customAlphabet(
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  8
);

const generateDisplayCertificateNo = () => {
  const year = new Date().getFullYear();
  return `SPC-${year}-${nanoid()}`;
};

export default generateDisplayCertificateNo;