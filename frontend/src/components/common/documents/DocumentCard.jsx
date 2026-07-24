import React from "react";

const statusStyles = {
  "Public Record": "bg-green-100 text-green-700",
  "Internal Document": "bg-amber-100 text-amber-700",
  "Yearly Archive": "bg-slate-200 text-slate-700",
};

const categoryColors = {
  "LEGAL STATUS": "bg-blue-100 text-blue-700",
  "GOVT PORTAL": "bg-blue-100 text-blue-700",
  "TAX EXEMPTION": "bg-green-100 text-green-700",
  "TRUST STANDARD": "bg-purple-100 text-purple-700",
  "STRATEGY": "bg-amber-100 text-amber-700",
  "ANNUAL REPORT": "bg-slate-200 text-slate-700",
};

const icons = {
  "LEGAL STATUS": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "TAX EXEMPTION": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "GOVT PORTAL": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M3 21h18M4 21V10l8-6 8 6v11M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "TRUST STANDARD": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M12 2l2.5 5.5L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  STRATEGY: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M3 7h18M3 12h18M3 17h12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "ANNUAL REPORT": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 3v3M16 3v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function ActionButton({ status, documentUrl }) {
  const isRestricted = status === "Internal Document";

  if (isRestricted) {
    return (
      
       <a href={documentUrl}
        className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-200 transition"
      >
        Request Access
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    );
  }

  return (
    
    <a href={documentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-[#E8741A] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#d1660f] transition"
    >
      Open PDF
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
export default function DocumentCard({ category, title, description, status, documentUrl }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-[#E8741A]/20 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

      <div className="absolute right-0 top-0 bg-[#0D4A52] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
        VERIFIED
      </div>

      <div className="p-7">

        <div className="w-14 h-14 rounded-2xl bg-[#E8741A]/10 flex items-center justify-center text-[#E8741A] mb-5">
          {icons[category] ?? icons.STRATEGY}
        </div>

        <span
          className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${
            categoryColors[category] ?? "bg-slate-100 text-slate-700"
          }`}
        >
          {category}
        </span>

        <h3 className="text-xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#E8741A] transition">
          {title}
        </h3>

        <p className="text-sm text-[#1A1A1A]/70 leading-7 mb-7">
          {description}
        </p>

        <div className="flex items-center justify-between border-t pt-5">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[status]}`}>
            {status}
          </span>

          <ActionButton status={status} documentUrl={documentUrl} />
        </div>

      </div>

    </div>
  );
}