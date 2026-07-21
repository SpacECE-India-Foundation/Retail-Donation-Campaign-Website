import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

export default function DonationForm({ initialAmount = null, campaignTitle = null }) {
  const navigate = useNavigate();

  const [selectedAmount, setSelectedAmount] = useState(
    PRESET_AMOUNTS.includes(initialAmount) ? initialAmount : null
  );
  const [customAmount, setCustomAmount] = useState(
    initialAmount && !PRESET_AMOUNTS.includes(initialAmount) ? String(initialAmount) : ""
  );

  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [errors, setErrors] = useState({});

  const finalAmount = selectedAmount ?? (customAmount ? Number(customAmount) : null);

  const handlePresetClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (event) => {
    setCustomAmount(event.target.value);
    setSelectedAmount(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!finalAmount || finalAmount <= 0) newErrors.amount = "Please select or enter a donation amount.";
    if (!donorName.trim()) newErrors.donorName = "Name is required.";
    if (!donorEmail.trim() || !/\S+@\S+\.\S+/.test(donorEmail)) newErrors.donorEmail = "Valid email is required.";
    if (!donorPhone.trim() || donorPhone.trim().length < 10) newErrors.donorPhone = "Valid phone number is required.";
    if (!transactionId.trim()) newErrors.transactionId = "Transaction ID is required after payment.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) return;
    navigate("/thank-you");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
      {campaignTitle && (
        <p className="text-sm text-gray-500 mb-4">
          Donating to: <span className="font-semibold text-brand-dark">{campaignTitle}</span>
        </p>
      )}

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
        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium mb-2">Your details</p>
        <input
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Full Name"
          className="w-full border rounded-lg mb-2 p-2 outline-none focus:border-brand-orange"
        />
        {errors.donorName && <p className="text-xs text-red-500 mb-2">{errors.donorName}</p>}

        <input
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          placeholder="Email Address"
          className="w-full border rounded-lg mb-2 p-2 outline-none focus:border-brand-orange"
        />
        {errors.donorEmail && <p className="text-xs text-red-500 mb-2">{errors.donorEmail}</p>}

        <input
          value={donorPhone}
          onChange={(e) => setDonorPhone(e.target.value)}
          placeholder="Phone Number"
          className="w-full border rounded-lg p-2 outline-none focus:border-brand-orange"
        />
        {errors.donorPhone && <p className="text-xs text-red-500 mt-1">{errors.donorPhone}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4 text-center">
          <p className="font-semibold mb-1">Instant UPI Payment</p>
          <p className="text-xs text-gray-500 mb-3">
            Instant execution using GooglePay, PhonePay, Paytm or BHIM apps.
          </p>
          <div className="border border-dashed h-32 flex items-center justify-center text-xs text-gray-400">
            QR CODE PLACEHOLDER
          </div>
        </div>

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

      <div className="mb-6">
        <p className="text-sm font-medium mb-2">After payment, enter your transaction / reference ID</p>
        <input
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="Transaction ID"
          className="w-full border rounded-lg p-2 outline-none focus:border-brand-orange"
        />
        {errors.transactionId && <p className="text-xs text-red-500 mt-1">{errors.transactionId}</p>}
      </div>

      <button
        type="button"
        onClick={handleProceed}
        className="w-full bg-brand-orange text-white rounded-lg py-3 font-medium transition hover:opacity-90"
      >
        Proceed to donate
      </button>

      <div className="border rounded-lg p-4 mt-6 text-xs text-gray-600">
        <strong>Post donation step:</strong> After executing your transaction, please email a copy of the
        payment receipt to secure your official 80G Tax Exemption Certificate. Verification and certificate
        dispatch are guaranteed within 48 hours.
      </div>
    </div>
  );
}