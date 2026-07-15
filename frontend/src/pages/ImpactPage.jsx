{/* Navbar component goes here (shared) */}

function ImpactPage() {
  return (
    <div className="bg-[#FDF6EC] py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Page heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Impact & Delivery</h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            We translate strategic donation metrics into concrete human outcomes
            so you see exactly how your resource distribution drives change at
            the grassroots level.
          </p>
        </div>

        {/* Impact tiers grid (amount -> outcome) */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-[#E8741A]/40 bg-white rounded-lg p-4">
            <p className="text-lg font-semibold text-primary mb-1">Rs. 500</p>
            <p className="text-xs text-gray-600">
              Trains one parent as a home learning facilitator for a full month.
            </p>
          </div>
          <div className="border border-[#E8741A]/40 bg-white rounded-lg p-4">
            <p className="text-lg font-semibold text-primary mb-1">Rs. 1000</p>
            <p className="text-xs text-gray-600">
              Equips one Anganwadi centre with early stimulation materials for one term.
            </p>
          </div>
          <div className="border border-[#E8741A]/40 bg-white rounded-lg p-4">
            <p className="text-lg font-semibold text-primary mb-1">Rs. 2,500</p>
            <p className="text-xs text-gray-600">
              Supports half a month of an Umang Fellow reaching 50+ children directly.
            </p>
          </div>
          <div className="border border-[#E8741A]/40 bg-white rounded-lg p-4">
            <p className="text-lg font-semibold text-primary mb-1">Rs. 5,000</p>
            <p className="text-xs text-gray-600">
              Supports one Umang Fellow for a full month, reaching 50+ children.
            </p>
          </div>
          <div className="border border-[#E8741A]/40 bg-white rounded-lg p-4">
            <p className="text-lg font-semibold text-primary mb-1">Rs. 15,000</p>
            <p className="text-xs text-gray-600">
              Runs a full parenting workshop for 30 families in an underserved community.
            </p>
          </div>
          <div className="border border-[#E8741A]/40 bg-white rounded-lg p-4">
            <p className="text-lg font-semibold text-primary mb-1">Rs. 50,000</p>
            <p className="text-xs text-gray-600">
              Funds one HAALS community hub for an entire year, serving 200+ children.
            </p>
          </div>
        </div>

        {/* Long-term outcomes + Policy alignment */}
        <div className="grid grid-cols-2 gap-4 mb-8">

          {/* Long-Term Change Outcomes */}
          <div className="border-2 border-primary rounded-lg p-4 bg-white">
            <p className="font-semibold mb-3">Long - Term Change Outcomes</p>
            <ul className="text-sm text-gray-700 space-y-2 list-none">
              <li>Reduced school dropout rates in primary grades.</li>
              <li>Stronger cognitive, emotional, and social development in the 0-8 age group.</li>
              <li>More capable, confident parents and caregivers as learning partners.</li>
              <li>Better-equipped frontline ICDS / Anganwadi workers.</li>
              <li>A generation of young Indians ready to learn, grow, and lead.</li>
            </ul>
          </div>

          {/* Strategic Policy Alignment */}
          <div className="border border-[#E8741A]/40 bg-white rounded-lg p-4">
            <p className="font-semibold mb-3">Strategic Policy Alignment</p>
            <p className="text-sm text-gray-700 mb-3">
              Our operational initiatives achieve direct system-level change
              systematically aligned with the National Education Policy (NEP)
              2020 and the National ECCE Policy 2013.
            </p>
            <div className="bg-gray-100 rounded p-3 text-xs italic text-gray-600 mb-3">
              "NEP 2020 mandates universal quality Early Childhood Education
              provision from age 3, with a target of full ECCE coverage by 2030."
            </div>
            <p className="text-xs font-semibold text-gray-800">
              The clear governmental mandate acts as a powerful structural
              tailwind for SpaceECE's frameworks across Indian communities.
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default ImpactPage

{/* Footer component goes here (shared) */}