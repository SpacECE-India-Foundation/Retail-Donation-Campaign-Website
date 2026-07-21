import { ChevronRight } from "lucide-react";

// Mock data for recent donations
const RECENT_DONATIONS = [
  {
    id: 1,
    name: "Priya Sharma",
    amount: 5000,
    time: "2 hours ago",
    avatar: "PS",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    amount: 2500,
    time: "4 hours ago",
    avatar: "RK",
  },
  {
    id: 3,
    name: "Anjali Patel",
    amount: 10000,
    time: "6 hours ago",
    avatar: "AP",
  },
  {
    id: 4,
    name: "Vikram Singh",
    amount: 1000,
    time: "1 day ago",
    avatar: "VS",
  },
];

export default function RecentDonations() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-dark">
            Recent Donations
          </h2>
          <p className="mt-2 text-brand-muted">
            Show the impact made by our generous supporters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RECENT_DONATIONS.map((donation) => (
          <div
            key={donation.id}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-gray-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-500 font-semibold text-white shadow-lg">
                  {donation.avatar}
                </div>
                <div>
                  <p className="font-semibold text-brand-dark">
                    {donation.name}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-muted">
                    {donation.time}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-brand-orange">
                  ₹{donation.amount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="inline-flex items-center gap-2 text-brand-orange font-semibold hover:gap-3 transition-all">
          View All Donations
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
