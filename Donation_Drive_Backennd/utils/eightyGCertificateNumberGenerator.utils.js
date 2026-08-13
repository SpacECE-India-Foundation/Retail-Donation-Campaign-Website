//this utility function is for creating a unique certificate number for each 80g certificate
import Counter from "../models/counter.modals.js";

// Generates a unique sequential certificate number for every 80G certificate.
export const eightyGCertificateNumber = async () => {
    try {
        const year = new Date().getFullYear();

        const counterKey = `80G-${year}`;

        const counter = await Counter.findOneAndUpdate(
            {
                key: counterKey,
            },
            {
                $inc: {
                    sequence: 1,
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        if (!counter || !counter.sequence) {
            throw new Error(
                "Failed to generate 80G certificate sequence number."
            );
        }

        return `SpaceECE-80G-${year}-${String(counter.sequence).padStart(6, "0")}`;

    } catch (error) {
        console.error(
            "Error generating 80G certificate number:",
            error
        );

        throw new Error(
            "Unable to generate 80G certificate number."
        );
    }
};