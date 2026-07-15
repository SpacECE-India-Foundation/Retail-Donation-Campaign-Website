import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

const problemPoints = [
  {
    stat: '1.37M',
    title: 'Anganwadi Centres, Low Outcomes',
    text: 'India has 1.37 million Anganwadi centres under ICDS, yet quality and learning outcomes remain low.',
  },
  {
    stat: '2030',
    title: 'NEP 2020 Deadline',
    text: 'NEP 2020 mandates universal quality ECCE by 2030 — a target requiring massive civil society effort.',
  },
  {
    title: 'Disparity Across Groups',
    text: 'Despite encouraging enrollment figures, significant disparity exists across states and socioeconomic groups.',
  },
  {
    title: 'No School Readiness',
    text: "Most children from low-income families arrive at Grade 1 without foundational school readiness skills.",
  },
  {
    title: 'Awareness Gap Among Parents',
    text: 'Parents in underserved communities lack awareness of developmental milestones and stimulation techniques.',
  },
  {
    title: 'Compounding Disadvantage',
    text: 'Early learning deprivation creates a compounding disadvantage: higher dropout, lower FLN attainment, reduced earning potential.',
  },
];

export default function ProblemPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-brand-bg)] px-6 py-20 text-center">
        <span className="inline-block rounded-full bg-white px-4 py-1 text-sm font-semibold text-[var(--color-brand-orange)] shadow-sm">
          The ECE Gap in India
        </span>
        <h1 className="mt-6 font-[Playfair_Display] text-4xl md:text-5xl font-bold text-[var(--color-brand-dark)]">
          A Critical Window, <span className="text-[var(--color-brand-orange)]">Widely Missed</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-gray-600">
          Despite India's scale of early childhood infrastructure, millions of children
          still enter school without the foundation they need to succeed.
        </p>
      </section>

      {/* Problem Cards */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {problemPoints.map((point, i) => (
            <Card key={i} className="flex flex-col gap-3">
              {point.stat && (
                <span className="text-3xl font-bold text-[var(--color-brand-orange)]">
                  {point.stat}
                </span>
              )}
              <h3 className="font-[Playfair_Display] text-lg font-bold text-[var(--color-brand-dark)]">
                {point.title}
              </h3>
              <p className="text-sm text-gray-600">{point.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-brand-teal)] px-6 py-16 text-center">
        <h2 className="font-[Playfair_Display] text-2xl md:text-3xl font-bold text-white">
          Help Us Close the Gap
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Every contribution helps a child get the early start they deserve.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="primary" size="lg">Donate Now</Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
            See Our Solution
          </Button>
        </div>
      </section>
    </>
  );
}