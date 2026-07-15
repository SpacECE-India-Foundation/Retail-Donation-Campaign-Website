import React from "react";

/**
 * DocumentCard
 * Reusable card for one organisation document entry.
 */
export default function DocumentCard({
  category,
  title,
  description,
  status,
  documentUrl,
}) {
  return (
    <div className="bg-[#FDF6EC] border border-[#E8741A]/40 rounded-xl p-5 flex flex-col h-full">
      <p className="text-xs font-semibold tracking-wide text-[#1A1A1A]/60 mb-2">
        {category}
      </p>
      <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-xs text-[#1A1A1A]/70 mb-4">{description}</p>

      <div className="border-t border-[#1A1A1A]/10 pt-3 mt-auto flex items-center justify-between">
        <span className="text-xs font-semibold text-[#1A1A1A]">
          {status}
        </span>

        
          <a href={documentUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#E8741A] hover:underline">
        
          View Document
          </a>
        
      </div>
    </div>
  );
}