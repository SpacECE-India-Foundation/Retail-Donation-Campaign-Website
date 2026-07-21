import DonationForm from "../components/common/donate/DonationForm";

function DonatePage() {
  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-brand-dark">Support Our Cause</h1>
        <p className="text-gray-600 mt-2">
          Your contribution directly maps to immediate developmental transformations
          for early childhood frameworks across India.
        </p>
      </div>

      <DonationForm />
    </div>
  );
}

export default DonatePage;