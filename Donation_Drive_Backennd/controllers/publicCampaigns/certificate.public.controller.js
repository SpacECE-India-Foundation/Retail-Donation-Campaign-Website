import Certificate from "../../models/certificate.modals.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";

/**
 * Public endpoint to verify certificate authenticity and view details
 * Tracks views and IP addresses for analytics
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // Validate certificate ID format
    ApiError.assert(
      certificateId && typeof certificateId === "string" && certificateId.length === 36,
      "Invalid certificate ID format"
    );

    // Find certificate by ID
    const certificate = await Certificate.findOne({
      certificateId: certificateId,
    }).select(
      "certificateId displayCertificateNo donorName campaignName amount donationDate certificateUrl verificationUrl verifiedAt viewCount lastViewedAt createdAt"
    );

    ApiError.notFound(certificate, "Certificate not found or invalid");

    // Capture client IP for tracking
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.connection.remoteAddress ||
      "unknown";

    // Increment view count and update tracking data
    await Certificate.findByIdAndUpdate(
      certificate._id,
      {
        $inc: { viewCount: 1 },
        $set: { lastViewedAt: new Date() },
        $addToSet: { ipAddresses: clientIp },
      },
      { new: true }
    );

    // Return certificate details (without donor email for privacy)
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          certificate: {
            certificateId: certificate.certificateId,
            displayCertificateNo: certificate.displayCertificateNo,
            donorName: certificate.donorName,
            campaignName: certificate.campaignName,
            amount: certificate.amount,
            donationDate: certificate.donationDate,
            certificateUrl: certificate.certificateUrl,
            verifiedAt: certificate.verifiedAt,
            viewCount: certificate.viewCount,
            issuedAt: certificate.createdAt,
          },
        },
        "Certificate verified successfully"
      )
    );
  } catch (error) {
    console.error("Certificate verification error:", error.message);
    return res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode || 500,
        error.message || "Failed to verify certificate"
      )
    );
  }
};

/**
 * Admin endpoint to view certificate analytics
 * Shows view tracking and verification history
 */
export const getCertificateAnalytics = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // Validate certificate ID
    ApiError.assert(
      certificateId && typeof certificateId === "string",
      "Invalid certificate ID"
    );

    // Find certificate with full details
    const certificate = await Certificate.findOne({
      certificateId: certificateId,
    }).populate("donation", "donorName donorEmail transactionId");

    ApiError.notFound(certificate, "Certificate not found");

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          analytics: {
            certificateId: certificate.certificateId,
            donorName: certificate.donorName,
            campaignName: certificate.campaignName,
            amount: certificate.amount,
            viewCount: certificate.viewCount,
            lastViewedAt: certificate.lastViewedAt,
            uniqueIpCount: certificate.ipAddresses.length,
            createdAt: certificate.createdAt,
            verifiedAt: certificate.verifiedAt,
          },
        },
        "Certificate analytics retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Certificate analytics error:", error.message);
    return res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode || 500,
        error.message || "Failed to retrieve certificate analytics"
      )
    );
  }
};

/**
 * Bulk certificate verification - check multiple certificates at once
 * Useful for batch verification requests
 */
export const verifyMultipleCertificates = async (req, res) => {
  try {
    const { certificateIds } = req.body;

    // Validate input
    ApiError.assert(
      Array.isArray(certificateIds) && certificateIds.length > 0,
      "certificateIds must be a non-empty array"
    );

    ApiError.assert(
      certificateIds.length <= 50,
      "Cannot verify more than 50 certificates at once"
    );

    // Find all certificates
    const certificates = await Certificate.find({
      certificateId: { $in: certificateIds },
    }).select(
      "certificateId donorName campaignName amount donationDate verifiedAt"
    );

    // Create response mapping
    const results = certificateIds.map((id) => {
      const cert = certificates.find((c) => c.certificateId === id);
      return {
        certificateId: id,
        isValid: !!cert,
        details: cert
          ? {
              donorName: cert.donorName,
              campaignName: cert.campaignName,
              amount: cert.amount,
              donationDate: cert.donationDate,
            }
          : null,
      };
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { results },
        "Batch certificate verification completed"
      )
    );
  } catch (error) {
    console.error("Batch certificate verification error:", error.message);
    return res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode || 500,
        error.message || "Failed to verify certificates"
      )
    );
  }
};
