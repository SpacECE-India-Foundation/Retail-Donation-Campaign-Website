import educateChild from "../assets/educate-child.jpg";
import digitalLearning from "../assets/digital-learning.jpg";
import healthyNutrition from "../assets/healthy-nutrition.jpg";

const mockCampaigns = [
  {
    id: 1,
    title: "Educate a Child",
    slug: "educate-a-child",
    image: educateChild,
    shortDescription:
      "Help provide quality education to underprivileged children and build a brighter future.",
    description:
      "This campaign focuses on providing quality education, school supplies, digital learning resources, and equal opportunities to underprivileged children across rural and urban communities.",
    milestones: [
      { title: "School Kits Distributed", targetAmount: 50000, raisedAmount: 50000, status: "completed" },
      { title: "Digital Classroom Setup", targetAmount: 150000, raisedAmount: 150000, status: "completed" },
      { title: "Teacher Training", targetAmount: 250000, raisedAmount: 195000, status: "in-progress" },
      { title: "1000 Students Enrolled", targetAmount: 500000, raisedAmount: 0, status: "locked" },
    ],
    goal: 500000,
    raised: 245000,
    contributors: 186,
    daysLeft: 42,
    progress: 49,
    status: "Active",
  },
  {
    id: 2,
    title: "Digital Learning",
    slug: "digital-learning",
    image: digitalLearning,
    shortDescription:
      "Support smart classrooms and digital learning resources for children.",
    description:
      "Support the creation of smart classrooms by providing computers, tablets, internet access, and digital learning content for students.",
    milestones: [
      { title: "School Kits Distributed", targetAmount: 50000, raisedAmount: 50000, status: "completed" },
      { title: "Digital Classroom Setup", targetAmount: 150000, raisedAmount: 150000, status: "completed" },
      { title: "Teacher Training", targetAmount: 250000, raisedAmount: 195000, status: "in-progress" },
      { title: "1000 Students Enrolled", targetAmount: 500000, raisedAmount: 0, status: "locked" },
    ],
    goal: 400000,
    raised: 180000,
    contributors: 121,
    daysLeft: 30,
    progress: 45,
    status: "Active",
  },
  {
    id: 3,
    title: "Healthy Nutrition",
    slug: "healthy-nutrition",
    image: healthyNutrition,
    shortDescription:
      "Provide nutritious meals and improve children's overall health.",
    description:
      "Ensure every child receives nutritious meals and regular health checkups to improve their physical and mental well-being.",
    milestones: [
      { title: "School Kits Distributed", targetAmount: 50000, raisedAmount: 50000, status: "completed" },
      { title: "Digital Classroom Setup", targetAmount: 150000, raisedAmount: 150000, status: "completed" },
      { title: "Teacher Training", targetAmount: 250000, raisedAmount: 195000, status: "in-progress" },
      { title: "1000 Students Enrolled", targetAmount: 500000, raisedAmount: 0, status: "locked" },
    ],
    goal: 300000,
    raised: 210000,
    contributors: 156,
    daysLeft: 18,
    progress: 70,
    status: "Active",
  },
];

export default mockCampaigns;