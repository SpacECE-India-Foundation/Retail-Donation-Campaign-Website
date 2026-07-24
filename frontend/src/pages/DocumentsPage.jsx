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

const trustBadges = [
  "12A & 80G Certified",
  "NGO Darpan Registered",
  "GuideStar India Certified",
];


export default function DocumentsPage() {
  return (
    <section className="bg-gradient-to-b from-[#FDF6EC] to-white py-20 px-6">
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#E8741A]/10 text-[#E8741A] px-4 py-2 rounded-full text-sm font-semibold mb-6">
  <span className="w-2 h-2 rounded-full bg-[#E8741A]"></span>
  Transparency & Governance
</div>
        <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-tight">
          Organisation Documents
        </h1>
        <p className="text-lg text-[#1A1A1A]/70 max-w-3xl mx-auto leading-8 mb-8">
        We believe transparency is the foundation of trust. Browse our verified legal
        registrations, tax certifications, governance standards, and annual
        publications that demonstrate our commitment to accountability and responsible
        social impact.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D4A52] bg-[#0D4A52]/10 rounded-full px-3 py-1.5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-3.5 h-3.5"
              >
                <path
                  d="M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {badge}
            </span>
          ))}
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
  {documents.map((doc, index) => (
    <div
      key={index}
      className={index === documents.length - 1 ? "lg:col-start-2" : ""}
    >
      <DocumentCard
        category={doc.category}
        title={doc.title}
        description={doc.description}
        status={doc.status}
        documentUrl={doc.documentUrl}
      />
    </div>
  ))}
</div>

       {/* Why These Documents Matter */}

      <div className="max-w-6xl mx-auto mt-20">
        <div className="text-center mb-12">
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#1A1A1A]">
            Why These Documents Matter
          </h2>

          <p className="text-[#1A1A1A]/70 mt-4 max-w-2xl mx-auto leading-7">
            Transparency is at the heart of everything we do. These documents
            allow donors, partners and supporters to verify our legal
            registrations, governance standards and organisational credibility.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-2xl p-6 border border-[#E8741A]/15 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="font-semibold text-lg text-[#1A1A1A] mb-2">
              Legal Compliance
            </h3>
            <p className="text-sm text-[#1A1A1A]/70 leading-6">
              Official registrations verify our legal identity and compliance
              with applicable regulations.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E8741A]/15 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-semibold text-lg text-[#1A1A1A] mb-2">
              Tax Benefits
            </h3>
            <p className="text-sm text-[#1A1A1A]/70 leading-6">
              Our recognised certifications help eligible donors receive tax
              benefits under applicable laws.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E8741A]/15 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-semibold text-lg text-[#1A1A1A] mb-2">
              Transparency
            </h3>
            <p className="text-sm text-[#1A1A1A]/70 leading-6">
              Governance records and annual publications demonstrate financial
              accountability and openness.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E8741A]/15 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="font-semibold text-lg text-[#1A1A1A] mb-2">
              Donor Trust
            </h3>
            <p className="text-sm text-[#1A1A1A]/70 leading-6">
              Every published document helps build confidence through verified
              organisational information.
            </p>
          </div>

        </div>
      </div>

      {/* Information Note */}

      <div className="max-w-4xl mx-auto mt-20">
        <div className="bg-white rounded-2xl border border-[#E8741A]/20 p-6 shadow-sm">
          <div className="flex gap-4">

            <div className="w-11 h-11 rounded-full bg-[#E8741A]/10 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5 text-[#E8741A]"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  d="M12 16v-4M12 8h.01"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-[#1A1A1A] mb-2">
                Need More Information?
              </h3>

              <p className="text-[#1A1A1A]/70 leading-7">
                All regulatory documents listed above correspond to official
                registrations and certifications. If you need additional
                compliance records or historical reports, please contact our
                governance team.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* CTA */}

      <div className="max-w-6xl mx-auto mt-20">
        <div className="rounded-3xl bg-gradient-to-r from-[#0D4A52] to-[#14616B] px-8 py-14 md:px-16 text-center">

          <span className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            ❤️ Support Transparency
          </span>

          <h2 className="font-['Playfair_Display'] text-4xl font-bold text-white mb-5">
            Support Our Mission with Confidence
          </h2>

          <p className="max-w-2xl mx-auto text-white/80 leading-8 mb-10">
            Every contribution supports impactful programmes while maintaining
            complete transparency, governance and accountability.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">

            <a
              href="/donate"
              className="bg-[#E8741A] hover:bg-[#d1660f] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105"
            >
              Donate Now
            </a>

            <a
              href="/about"
              className="border border-white/30 hover:bg-white hover:text-[#0D4A52] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300"
            >
              Learn More
            </a>

          </div>

        </div>
      </div>

    </section>
  );
}       