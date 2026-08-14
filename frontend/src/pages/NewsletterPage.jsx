import { useState } from "react";
import { Mail, CheckCircle2, AlertTriangle, Send, ShieldCheck, Sparkles } from "lucide-react";
import { subscribeToNewsletter } from "../services/newsletterService";

const perks = [
  "New campaign launches, first",
  "Field updates from our programmes",
  "Milestones and impact reports",
];

export default function NewsletterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | success | error
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("saving");
    try {
      await subscribeToNewsletter({ name: name.trim(), email: email.trim() });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#FDF6EC] to-white px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#E8741A]/10 px-4 py-2 text-sm font-semibold text-[#E8741A]">
          <Sparkles size={15} aria-hidden="true" />
          Stay Connected
        </div>
        <h1
          className="text-5xl font-bold leading-tight text-[#1A1A1A] md:text-6xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Get our newsletter
        </h1>
        <p className="mx-auto mb-2 mt-5 max-w-xl text-lg leading-8 text-[#1A1A1A]/70">
          Hear directly from the field — new campaigns, milestones, and the
          real impact your community is making, straight to your inbox.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-lg">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={26} aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">You're subscribed!</h2>
              <p className="max-w-xs text-sm text-gray-500">
                Thanks, {name.trim() || "friend"} — keep an eye on your inbox for updates from SpacECE India Foundation.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8741A]/10 text-[#E8741A]">
                  <Mail size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">Subscribe for updates</h2>
                  <p className="text-sm text-gray-400">Takes ten seconds, unsubscribe anytime.</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertTriangle size={15} aria-hidden="true" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-600">Your name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    disabled={status === "saving"}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#E8741A] focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-600">Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    disabled={status === "saving"}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#E8741A] focus:bg-white"
                  />
                </label>

                <button
                  type="submit"
                  disabled={status === "saving"}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #E8741A, #D86712)",
                    boxShadow: "0 12px 30px -8px rgba(230,126,34,0.55)",
                  }}
                >
                  {status === "saving" ? "Subscribing..." : "Subscribe"}
                  <Send size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </form>
            </>
          )}
        </div>

        <ul className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <ShieldCheck size={13} style={{ color: "#0D4A52" }} aria-hidden="true" />
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}