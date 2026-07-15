import React from "react";
import DocumentCard from "../components/common/documents/DocumentCard";

const documents = [
  {
    category: "LEGAL STATUS",
    title: "Certificate of Incorporation",
    description: "Section 8 (Companies Act 2013) - Non-profit legal status",
    status: "Public Record",
    documentUrl: "#",
  },
  {
    category: "TAX EXEMPTION",
    title: "12A Registration",
    description: "Income tax exemption granted by Income Tax Dept / MCA",
    status: "Public Record",
    documentUrl: "#",
  },
  {
    category: "TAX EXEMPTION",
    title: "80G Certificate",
    description: "Donors eligible for income tax deduction - IT Dept",
    status: "Public Record",
    documentUrl: "#",
  },
  {
    category: "GOVT PORTAL",
    title: "NGO Darpan Registration",
    description: "Govt of India portal for non-profit registration and management",
    status: "Public Record",
    documentUrl: "#",
  },
  {
    category: "TRUST STANDARD",
    title: "GuideStar India Certificate",
    description: "Certified transparency, accountability & governance standards",
    status: "Public Record",
    documentUrl: "#",
  },
  {
    category: "STRATEGY",
    title: "Organisation Pitch Deck",
    description: "Full programme overview, strategy, theory of change, financials",
    status: "Internal Document",
    documentUrl: "#",
  },
  {
    category: "ANNUAL REPORT",
    title: "Annual Reports & Publications",
    description: "Research outputs, programme outcomes, field data",
    status: "Yearly Archive",
    documentUrl: "#",
  },
];

export default function DocumentsPage() {
  return (
    <section className="bg-[#FFFDF8] py-16 px-6">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[#1A1A1A] mb-4">
          Organisation Documents
        </h1>
        <p className="text-sm text-[#1A1A1A]/70 max-w-2xl mx-auto">
          Demonstrating our legal compliance, transparency and governance
          standards to build absolute donor trust.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc, index) => (
          <DocumentCard
            key={index}
            category={doc.category}
            title={doc.title}
            description={doc.description}
            status={doc.status}
            documentUrl={doc.documentUrl}
          />
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-12">
        <div className="bg-[#FDF6EC] border border-[#E8741A]/40 rounded-lg p-4 text-center">
          <p className="text-xs text-[#1A1A1A]/70">
            All regulatory compliance archives listed above are linked
            directly with corresponding governmental ministry registers. For
            queries regarding legacy fiscal transparency records, reach out
            directly to governance operations.
          </p>
        </div>
      </div>
    </section>
  );
}