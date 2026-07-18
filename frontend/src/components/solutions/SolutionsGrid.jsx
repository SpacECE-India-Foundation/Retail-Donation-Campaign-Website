import haalsIcon from "../../assets/icons/haals.png";
import umangIcon from "../../assets/icons/umang.png";
import sakshamIcon from "../../assets/icons/saksham.png";
import internshipIcon from "../../assets/icons/internship.png";
import spacetalksIcon from "../../assets/icons/spacetalks.png";
import researchIcon from "../../assets/icons/research.png";

export const SolutionsGrid = () => {
  const solutions = [
    {
      number: "01",
      label: "MODULE",
      title: "HAALS",
      description: "Home-as-a-Learning-SPACE: Transforms homes into vibrant learning environments. Establishes learning centres in underserved communities. Trains parents to be their child's first teacher.",
      link: "Explore HAALS Module",
      icon: haalsIcon,
    },
    {
      number: "02",
      label: "PROGRAM",
      title: "Umang Fellowship",
      description: "Young change-makers recruited and mentored as education fellows who work alongside Anganwadi workers to improve ECE quality at grassroots level.",
      link: "Read Fellowship Details",
      icon: umangIcon,
    },
    {
      number: "03",
      label: "FRAMEWORK",
      title: "Saksham 2.0",
      description: "Foundational Literacy and Numeracy (FLN) accelerator with sub-modules: FLN Observation, Remedial Observation, Remedial Monitoring and Library Monitoring.",
      link: "Read FLN Framework",
      icon: sakshamIcon,
    },
    {
      number: "04",
      label: "INITIATIVE",
      title: "Internship Incubation",
      description: "Innovative model: all responsibilities from CEO downwards are run by interns. Gives holistic organisational experience and creates pipeline of socially motivated professionals.",
      link: "Join the Incubator",
      icon: internshipIcon,
    },
    {
      number: "05",
      label: "MEDIA",
      title: "SPACE Talks & Content Library",
      description: "Online training workshops ('SPACE Talks' series) and a YouTube / offline video gallery built for the Indian context - child development content from 0-8 years.",
      link: "Access Content Library",
      icon: spacetalksIcon,
    },
    {
      number: "06",
      label: "METHOD",
      title: "Research-Backed Approach",
      description: "All programmes grounded in evidence: RCT proposals, feasibility studies, usability research, mirror-word study, desk research on FLN Mission 2023.",
      link: "Browse Our Research",
      icon: researchIcon,
    },
  ];

  return (
    <section className="w-full py-16 px-6" style={{ background: "var(--color-brand-bg)" }}>
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {solutions.map((item) => (
          <div
            key={item.number}
            className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">
              <p
                className="text-xs font-bold tracking-wide"
                style={{ color: "var(--color-brand-orange)" }}
              >
                {item.number} / {item.label}
              </p>
              <img
                src={item.icon}
                alt={item.title}
                className="w-12 h-12 rounded-lg flex-shrink-0 object-contain"
              />
            </div>
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "var(--color-brand-dark)" }}
            >
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 mb-6 flex-grow">
              {item.description}
            </p>
            <p
              className="text-sm font-semibold cursor-pointer"
              style={{ color: "var(--color-brand-dark)" }}
            >
              {item.link}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};