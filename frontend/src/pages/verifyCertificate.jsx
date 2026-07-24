// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   ShieldCheck,
//   BadgeCheck,
//   Calendar,
//   IndianRupee,
//   User,
//   FileCheck,
//   Download,
//   Copy,
//   Check,
//   Loader2,
//   AlertTriangle,
//   Award,
//   HeartHandshake,
//   ExternalLink,
//   Sparkles,
// } from "lucide-react";

// const CertificateVerificationPage = () => {
//   const { certificateId } = useParams();

//   const [loading, setLoading] = useState(true);
//   const [certificate, setCertificate] = useState(null);
//   const [error, setError] = useState("");
//   const [copied, setCopied] = useState(false);

//   useEffect(() => {
//     fetchCertificate();
//   }, [certificateId]);

//   const fetchCertificate = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await axios.get(
//         `${import.meta.env.VITE_API_URL}/public/certificate/verify/${certificateId}`
//       );

//       setCertificate(response.data?.data?.certificate);
//     } catch (err) {
//       setError(
//         err?.response?.data?.message ||
//           "We could not verify this certificate. Please check the URL or ID and try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyCertificateId = () => {
//     if (!certificate?.certificateId) return;
//     navigator.clipboard.writeText(certificate.certificateId);
//     setCopied(true);
//     toast.success("Certificate ID copied to clipboard!");
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return isNaN(date.getTime())
//       ? dateString
//       : date.toLocaleDateString("en-IN", {
//           day: "numeric",
//           month: "short",
//           year: "numeric",
//         });
//   };

//   // ---------------------------------------------------------------------------
//   // LOADING STATE
//   // ---------------------------------------------------------------------------
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
//         <div className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full text-center">
//           <div className="relative flex items-center justify-center mb-4">
//             <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75"></div>
//             <div className="relative p-4 bg-emerald-50 text-emerald-600 rounded-full">
//               <Loader2 className="w-10 h-10 animate-spin" />
//             </div>
//           </div>
//           <h3 className="text-xl font-bold text-slate-800">Verifying Record</h3>
//           <p className="text-sm text-slate-500 mt-1">
//             Checking authenticity with SpaceECE registry...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ---------------------------------------------------------------------------
//   // ERROR STATE
//   // ---------------------------------------------------------------------------
//   if (error) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
//         <Toaster position="top-center" />
//         <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-8">
//           <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <AlertTriangle className="w-8 h-8" />
//           </div>
//           <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
//           <p className="text-slate-600 mt-2 text-sm leading-relaxed">{error}</p>
          
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-6 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition duration-200 shadow-sm"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ---------------------------------------------------------------------------
//   // SUCCESS STATE
//   // ---------------------------------------------------------------------------
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-emerald-50/30 py-10 px-4 sm:px-6 lg:px-8">
//       <Toaster position="top-center" />

//       <div className="max-w-3xl mx-auto">
//         {/* Main Card */}
//         <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          
//           {/* Header Banner */}
//           <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-800 p-6 sm:p-8 text-white relative overflow-hidden">
//             <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
//             <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
//               <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
//                 <ShieldCheck className="w-10 h-10 text-emerald-300" />
//               </div>

//               <div>
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-2 backdrop-blur-sm border border-emerald-400/30">
//                   <Sparkles className="w-3.5 h-3.5" /> SpaceECE Official Verification
//                 </div>
//                 <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
//                   Certificate Verified
//                 </h1>
//                 <p className="text-emerald-100/90 text-sm mt-1 max-w-lg">
//                   This donor recognition certificate is authentic and recorded in the SpaceECE Early Childhood Education Foundation database.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Sub Header / Authentic Badge */}
//           <div className="px-6 py-4 bg-emerald-50/60 border-b border-emerald-100/60 flex items-center justify-between gap-4">
//             <div className="flex items-center gap-2">
//               <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />
//               <span className="text-sm font-semibold text-emerald-900">
//                 Official Donation Record
//               </span>
//             </div>
//             <span className="text-xs font-medium text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
//               Valid & Active
//             </span>
//           </div>

//           {/* Details Section */}
//           <div className="p-6 sm:p-8 space-y-6">
            
//             {/* Grid Items */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
//               {/* Donor Name */}
//               <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all duration-200">
//                 <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
//                   <User className="w-4 h-4 text-emerald-600" /> Donor Name
//                 </div>
//                 <p className="text-lg font-bold text-slate-900 truncate">
//                   {certificate?.donorName || "N/A"}
//                 </p>
//               </div>

//               {/* Campaign */}
//               <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all duration-200">
//                 <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
//                   <HeartHandshake className="w-4 h-4 text-rose-500" /> Campaign
//                 </div>
//                 <p className="text-lg font-bold text-slate-900 truncate">
//                   {certificate?.campaignName || "General Donation"}
//                 </p>
//               </div>

//               {/* Amount */}
//               <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all duration-200">
//                 <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
//                   <IndianRupee className="w-4 h-4 text-amber-500" /> Donation Amount
//                 </div>
//                 <p className="text-lg font-bold text-slate-900">
//                   ₹{certificate?.amount ? certificate.amount.toLocaleString("en-IN") : "0"}
//                 </p>
//               </div>

//               {/* Certificate Number */}
//               <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all duration-200">
//                 <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
//                   <Award className="w-4 h-4 text-amber-600" /> Certificate No.
//                 </div>
//                 <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">
//                   {certificate?.displayCertificateNo || "N/A"}
//                 </p>
//               </div>

//               {/* Donation Date */}
//               <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all duration-200">
//                 <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
//                   <Calendar className="w-4 h-4 text-sky-600" /> Donation Date
//                 </div>
//                 <p className="text-base font-bold text-slate-800">
//                   {formatDate(certificate?.donationDate)}
//                 </p>
//               </div>

//               {/* Verified On */}
//               <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all duration-200">
//                 <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
//                   <FileCheck className="w-4 h-4 text-teal-600" /> System Verification
//                 </div>
//                 <p className="text-base font-bold text-slate-800">
//                   {formatDate(certificate?.verifiedAt || new Date())}
//                 </p>
//               </div>
//             </div>

//             {/* Certificate Hash / ID Section */}
//             <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center">
//               <span className="text-xs text-slate-400 font-medium">
//                 Internal Verification ID
//               </span>
//               <div className="mt-1.5 flex items-center gap-2 bg-slate-100/80 px-3.5 py-1.5 rounded-xl border border-slate-200/60">
//                 <code className="text-xs font-mono text-slate-700">
//                   {certificate?.certificateId}
//                 </code>
//                 <button
//                   onClick={copyCertificateId}
//                   className="p-1 text-slate-400 hover:text-slate-700 transition duration-150 rounded-md focus:outline-none"
//                   title="Copy Certificate ID"
//                 >
//                   {copied ? (
//                     <Check className="w-4 h-4 text-emerald-600" />
//                   ) : (
//                     <Copy className="w-4 h-4" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Actions */}
//             {certificate?.certificateUrl && (
//               <div className="pt-2 flex flex-col sm:flex-row gap-3">
//                 <a
//                   href={certificate.certificateUrl}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
//                 >
//                   <Download className="w-5 h-5" />
//                   Download Certificate PDF
//                 </a>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer info */}
//         <p className="text-center text-xs text-slate-400 mt-6">
//           Need help? Contact SpaceECE Support if you suspect any discrepancies with this certificate.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default CertificateVerificationPage;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ShieldCheck,
  BadgeCheck,
  Calendar,
  IndianRupee,
  User,
  FileCheck,
  Download,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Award,
  HeartHandshake,
  Sparkles,
} from "lucide-react";

const CertificateVerificationPage = () => {
  const { certificateId } = useParams();

  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/public/certificate/verify/${certificateId}`
      );

      setCertificate(response.data?.data?.certificate);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "We could not verify this certificate. Please check the URL or ID and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCertificateId = () => {
    if (!certificate?.certificateId) return;
    navigator.clipboard.writeText(certificate.certificateId);
    setCopied(true);
    toast.success("Certificate ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full text-center">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-75"></div>
            <div className="relative p-4 bg-amber-50 text-amber-600 rounded-full">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Verifying Record</h3>
          <p className="text-sm text-slate-500 mt-1">
            Checking authenticity with SpaceECE registry...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Toaster position="top-center" />
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-8">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">{error}</p>
          
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition duration-200 shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // SUCCESS STATE (Warm Amber / Orange Brand Contrast)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/40 to-orange-50/30 py-10 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />

      <div className="max-w-3xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          
          {/* Header Banner - Signature Amber to Warm Orange Gradient */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <ShieldCheck className="w-10 h-10 text-amber-100" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 text-amber-100 text-xs font-semibold mb-2 backdrop-blur-sm border border-white/20">
                  <Sparkles className="w-3.5 h-3.5" /> SpaceECE Official Verification
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Certificate Verified
                </h1>
                <p className="text-amber-100/90 text-sm mt-1 max-w-lg">
                  This donor recognition certificate is authentic and recorded in the SpaceECE Early Childhood Education Foundation database.
                </p>
              </div>
            </div>
          </div>

          {/* Sub Header / Authentic Badge */}
          <div className="px-6 py-4 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-sm font-semibold text-amber-950">
                Official Donation Record
              </span>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200/60">
              Valid & Active
            </span>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Grid Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Donor Name */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-all duration-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  <User className="w-4 h-4 text-amber-600" /> Donor Name
                </div>
                <p className="text-lg font-bold text-slate-900 truncate">
                  {certificate?.donorName || "N/A"}
                </p>
              </div>

              {/* Campaign */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-all duration-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  <HeartHandshake className="w-4 h-4 text-orange-500" /> Campaign
                </div>
                <p className="text-lg font-bold text-slate-900 truncate">
                  {certificate?.campaignName || "General Donation"}
                </p>
              </div>

              {/* Amount */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-all duration-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  <IndianRupee className="w-4 h-4 text-amber-600" /> Donation Amount
                </div>
                <p className="text-lg font-bold text-amber-600">
                  ₹{certificate?.amount ? certificate.amount.toLocaleString("en-IN") : "0"}
                </p>
              </div>

              {/* Certificate Number */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-all duration-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4 text-amber-600" /> Certificate No.
                </div>
                <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                  {certificate?.displayCertificateNo || "N/A"}
                </p>
              </div>

              {/* Donation Date */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-all duration-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4 text-amber-600" /> Donation Date
                </div>
                <p className="text-base font-bold text-slate-800">
                  {formatDate(certificate?.donationDate)}
                </p>
              </div>

              {/* Verified On */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-all duration-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  <FileCheck className="w-4 h-4 text-amber-600" /> System Verification
                </div>
                <p className="text-base font-bold text-slate-800">
                  {formatDate(certificate?.verifiedAt || new Date())}
                </p>
              </div>
            </div>

            {/* Certificate Hash / ID Section */}
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 font-medium">
                Internal Verification ID
              </span>
              <div className="mt-1.5 flex items-center gap-2 bg-slate-100/80 px-3.5 py-1.5 rounded-xl border border-slate-200/60">
                <code className="text-xs font-mono text-slate-700">
                  {certificate?.certificateId}
                </code>
                <button
                  onClick={copyCertificateId}
                  className="p-1 text-slate-400 hover:text-slate-700 transition duration-150 rounded-md focus:outline-none"
                  title="Copy Certificate ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            {certificate?.certificateUrl && (
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={certificate.certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Download className="w-5 h-5" />
                  Download Certificate PDF
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Need help? Contact SpaceECE Support if you suspect any discrepancies with this certificate.
        </p>
      </div>
    </div>
  );
};

export default CertificateVerificationPage;