import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

function DonatePage() {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");

  const handlePresetClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (event) => {
    setCustomAmount(event.target.value);
    setSelectedAmount(null);
  };

  const finalAmount = selectedAmount ?? (customAmount ? Number(customAmount) : null);

  const handleProceed = () => {
    if (!finalAmount || finalAmount <= 0) {
      alert("Please select or enter a donation amount first.");
      return;
    }
    // Real submission endpoint isn't live on the backend yet —
    // for now this just moves the demo flow forward.
    navigate("/thank-you");
  };

  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10">

      {/* Page heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-brand-dark">Support Our Cause</h1>
        <p className="text-gray-600 mt-2">
          Your contribution directly maps to immediate developmental transformations
          for early childhood frameworks across India.
        </p>
      </div>

      {/* Main donation card */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">

        {/* Amount selection */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Choose or enter a donation value (INR)</p>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handlePresetClick(amount)}
                className={`border rounded-lg py-3 transition ${
                  selectedAmount === amount
                    ? "bg-brand-orange text-white border-brand-orange"
                    : "border-gray-300 hover:border-brand-orange"
                }`}
              >
                ₹{amount.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            value={customAmount}
            onChange={handleCustomChange}
            placeholder="Other custom amount (INR)"
            className="w-full border rounded-lg mt-3 p-2 outline-none focus:border-brand-orange"
          />
        </div>

        {/* Payment methods - side by side */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          {/* UPI QR */}
          <div className="border rounded-lg p-4 text-center">
            <p className="font-semibold mb-1">Instant UPI Payment</p>
            <p className="text-xs text-gray-500 mb-3">
              Instant execution using GooglePay, PhonePay, Paytm or BHIM apps.
            </p>
            <div className="border border-dashed h-32 flex items-center justify-center text-xs text-gray-400">
              QR CODE PLACEHOLDER
            </div>
          </div>

          {/* Bank transfer */}
          <div className="border rounded-lg p-4">
            <p className="font-semibold mb-1">Bank Wire Transfer</p>
            <p className="text-xs text-gray-500 mb-3">
              Process securely via standard IMPS, NEFT or RTGS banking networks.
            </p>
            <input placeholder="Account Name" className="w-full border-b mb-2 text-sm p-1" />
            <input placeholder="Bank Name" className="w-full border-b mb-2 text-sm p-1" />
            <input placeholder="Account No." className="w-full border-b mb-2 text-sm p-1" />
            <input placeholder="IFSC Code" className="w-full border-b mb-2 text-sm p-1" />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={handleProceed}
          className="w-full bg-brand-orange text-white rounded-lg py-3 font-medium transition hover:opacity-90"
        >
          Proceed to donate
        </button>
      </div>

      {/* Post donation note */}
      <div className="max-w-2xl mx-auto border rounded-lg p-4 mt-6 text-xs text-gray-600">
        <strong>Post donation step:</strong> After executing your transaction, please email a copy of the
        payment receipt to secure your official 80G Tax Exemption Certificate. Verification and certificate
        dispatch are guaranteed within 48 hours.
      </div>

    </div>
  );
}

export default DonatePage;