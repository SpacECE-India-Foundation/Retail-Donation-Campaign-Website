import { Calendar, MapPin } from "lucide-react";

// Mock data for campaign updates
const CAMPAIGN_UPDATES = [
  {
    id: 1,
    title: "Phase 1 Learning Kits Distribution Complete",
    date: "2026-07-15",
    location: "Maharashtra",
    description:
      "Successfully distributed 500 early learning kits to Anganwadi centres across rural Maharashtra. The impact is already visible in improved early childhood development outcomes.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "New Facilitator Training Program Launched",
    date: "2026-07-10",
    location: "Online",
    description:
      "We're training 200 parents as home-learning facilitators. The first batch of 50 parents has completed their training and is already making a difference.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Reached 1,000+ Contributors Milestone",
    date: "2026-07-01",
    location: "All India",
    description:
      "Thanks to our incredible supporters, we've crossed 1,000 contributors! This milestone shows the growing momentum of our movement for early childhood development.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  },
];

export default function CampaignUpdates() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-dark">
          Campaign Updates
        </h2>
        <p className="mt-2 text-brand-muted">
          Stay informed about the latest progress and milestones
        </p>
      </div>

      <div className="space-y-6">
        {CAMPAIGN_UPDATES.map((update, idx) => (
          <div
            key={update.id}
            className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8">
              {/* Image */}
              <div className="md:col-span-1">
                <div className="relative h-48 md:h-full overflow-hidden rounded-xl">
                  <img
                    src={update.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted font-semibold uppercase tracking-wider mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(update.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {update.location}
                    </div>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-brand-dark">
                    {update.title}
                  </h3>
                  <p className="mt-3 text-brand-muted leading-relaxed">
                    {update.description}
                  </p>
                </div>
                <div className="mt-4">
                  <button className="inline-flex text-brand-orange font-semibold text-sm hover:text-brand-dark transition-colors">
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
