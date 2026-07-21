// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

// function DonatePage() {
//   const navigate = useNavigate();
//   const [selectedAmount, setSelectedAmount] = useState(null);
//   const [customAmount, setCustomAmount] = useState("");

//   const handlePresetClick = (amount) => {
//     setSelectedAmount(amount);
//     setCustomAmount("");
//   };

//   const handleCustomChange = (event) => {
//     setCustomAmount(event.target.value);
//     setSelectedAmount(null);
//   };

//   const finalAmount = selectedAmount ?? (customAmount ? Number(customAmount) : null);

//   const handleProceed = () => {
//     if (!finalAmount || finalAmount <= 0) {
//       alert("Please select or enter a donation amount first.");
//       return;
//     }
//     // Real submission endpoint isn't live on the backend yet —
//     // for now this just moves the demo flow forward.
//     navigate("/thank-you");
//   };

//   return (
//     <div className="min-h-screen bg-brand-cream px-6 py-10">

//       {/* Page heading */}
//       <div className="text-center mb-10">
//         <h1 className="text-3xl font-bold text-brand-dark">Support Our Cause</h1>
//         <p className="text-gray-600 mt-2">
//           Your contribution directly maps to immediate developmental transformations
//           for early childhood frameworks across India.
//         </p>
//       </div>

//       {/* Main donation card */}
//       <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">

//         {/* Amount selection */}
//         <div className="mb-6">
//           <p className="text-sm font-medium mb-2">Choose or enter a donation value (INR)</p>
//           <div className="grid grid-cols-4 gap-3">
//             {PRESET_AMOUNTS.map((amount) => (
//               <button
//                 key={amount}
//                 type="button"
//                 onClick={() => handlePresetClick(amount)}
//                 className={`border rounded-lg py-3 transition ${
//                   selectedAmount === amount
//                     ? "bg-brand-orange text-white border-brand-orange"
//                     : "border-gray-300 hover:border-brand-orange"
//                 }`}
//               >
//                 ₹{amount.toLocaleString("en-IN")}
//               </button>
//             ))}
//           </div>
//           <input
//             type="number"
//             min="1"
//             value={customAmount}
//             onChange={handleCustomChange}
//             placeholder="Other custom amount (INR)"
//             className="w-full border rounded-lg mt-3 p-2 outline-none focus:border-brand-orange"
//           />
//         </div>

//         {/* Payment methods - side by side */}
//         <div className="grid grid-cols-2 gap-4 mb-6">

//           {/* UPI QR */}
//           <div className="border rounded-lg p-4 text-center">
//             <p className="font-semibold mb-1">Instant UPI Payment</p>
//             <p className="text-xs text-gray-500 mb-3">
//               Instant execution using GooglePay, PhonePay, Paytm or BHIM apps.
//             </p>
//             <div className="border border-dashed h-32 flex items-center justify-center text-xs text-gray-400">
//               QR CODE PLACEHOLDER
//             </div>
//           </div>

//           {/* Bank transfer */}
//           <div className="border rounded-lg p-4">
//             <p className="font-semibold mb-1">Bank Wire Transfer</p>
//             <p className="text-xs text-gray-500 mb-3">
//               Process securely via standard IMPS, NEFT or RTGS banking networks.
//             </p>
//             <input placeholder="Account Name" className="w-full border-b mb-2 text-sm p-1" />
//             <input placeholder="Bank Name" className="w-full border-b mb-2 text-sm p-1" />
//             <input placeholder="Account No." className="w-full border-b mb-2 text-sm p-1" />
//             <input placeholder="IFSC Code" className="w-full border-b mb-2 text-sm p-1" />
//           </div>
//         </div>

//         {/* Submit button */}
//         <button
//           type="button"
//           onClick={handleProceed}
//           className="w-full bg-brand-orange text-white rounded-lg py-3 font-medium transition hover:opacity-90"
//         >
//           Proceed to donate
//         </button>
//       </div>

//       {/* Post donation note */}
//       <div className="max-w-2xl mx-auto border rounded-lg p-4 mt-6 text-xs text-gray-600">
//         <strong>Post donation step:</strong> After executing your transaction, please email a copy of the
//         payment receipt to secure your official 80G Tax Exemption Certificate. Verification and certificate
//         dispatch are guaranteed within 48 hours.
//       </div>

//     </div>
//   );
// }

// export default DonatePage;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  IndianRupee,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

const DonatePage = () => {
  const navigate = useNavigate();

  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");

  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    address: "",
    donorMessage: "",
    amount: "",
    paymentMode: "UPI",
    transactionId: "",
    campaign: "686e3d5ca6f0baf18cf0f001", // replace with actual campaign id
  });

  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePresetClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");

    setFormData((prev) => ({
      ...prev,
      amount,
    }));
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;

    setSelectedAmount(null);
    setCustomAmount(value);

    setFormData((prev) => ({
      ...prev,
      amount: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setScreenshot(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  return (
    <div className="min-h-screen bg-orange-50">

      {/* HERO SECTION */}

      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600">

        <div className="max-w-7xl mx-auto px-6 py-20">

          <div className="max-w-3xl text-white">

            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-8 h-8 fill-white" />
              <span className="font-semibold tracking-wide uppercase">
                Support Education
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Every Donation Creates
              <span className="block">
                A Better Future
              </span>
            </h1>

            <p className="mt-6 text-lg text-orange-100 leading-relaxed">
              Help us transform early childhood education across India.
              Your contribution directly supports learning resources,
              teacher development, and impactful educational initiatives.
            </p>

            <div className="flex gap-6 mt-8">

              <div>
                <h3 className="text-3xl font-bold">₹12L+</h3>
                <p className="text-orange-100">
                  Raised So Far
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold">5,000+</h3>
                <p className="text-orange-100">
                  Donors
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold">200+</h3>
                <p className="text-orange-100">
                  Schools Impacted
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* MAIN SECTION */}

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT SECTION */}

          <div className="lg:col-span-2">

            {/* CAMPAIGN CARD */}

            <div className="bg-white rounded-3xl shadow-sm border p-6 mb-8">

              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7"
                alt="campaign"
                className="w-full h-72 object-cover rounded-2xl"
              />

              <div className="mt-6">

                <h2 className="text-3xl font-bold text-gray-800">
                  Early Childhood Education Campaign
                </h2>

                <p className="text-gray-600 mt-3 leading-relaxed">
                  This initiative focuses on strengthening early childhood
                  education systems through teacher training, innovative
                  learning methodologies, community engagement, and
                  educational infrastructure support.
                </p>

                <div className="mt-6">

                  <div className="flex justify-between mb-2">
                    <span className="font-medium">
                      Raised ₹12,50,000
                    </span>

                    <span className="font-medium">
                      Goal ₹20,00,000
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">

                    <div
                      className="bg-orange-500 h-full rounded-full"
                      style={{ width: "62%" }}
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* DONATION AMOUNT */}

            <div className="bg-white rounded-3xl shadow-sm border p-8 mb-8">

              <div className="flex items-center gap-3 mb-6">
                <IndianRupee className="text-orange-500" />
                <h2 className="text-2xl font-bold">
                  Select Donation Amount
                </h2>
              </div>

              <div className="grid md:grid-cols-4 gap-4">

                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handlePresetClick(amount)}
                    className={`rounded-xl py-4 font-semibold border transition-all
                    ${
                      selectedAmount === amount
                        ? "bg-orange-500 text-white border-orange-500"
                        : "border-gray-300 hover:border-orange-500"
                    }`}
                  >
                    ₹{amount.toLocaleString("en-IN")}
                  </button>
                ))}

              </div>

              <div className="mt-5">

                <input
                  type="number"
                  placeholder="Enter custom donation amount"
                  value={customAmount}
                  onChange={handleCustomAmount}
                  className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-orange-500"
                />

              </div>

            </div>

            {/* DONOR INFORMATION */}

            <div className="bg-white rounded-3xl shadow-sm border p-8">

              <h2 className="text-2xl font-bold mb-8">
                Donor Information
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="block mb-2 font-medium">
                    Full Name *
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-4 top-4 text-gray-400"
                    />

                    <input
                      type="text"
                      name="donorName"
                      value={formData.donorName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full border rounded-xl pl-11 p-4 outline-none focus:ring-2 focus:ring-orange-500"
                    />

                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    Email Address *
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-4 top-4 text-gray-400"
                    />

                    <input
                      type="email"
                      name="donorEmail"
                      value={formData.donorEmail}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full border rounded-xl pl-11 p-4 outline-none focus:ring-2 focus:ring-orange-500"
                    />

                  </div>
                </div>
                                {/* PHONE NUMBER */}

                <div>
                  <label className="block mb-2 font-medium">
                    Phone Number
                  </label>

                  <div className="relative">

                    <Phone
                      size={18}
                      className="absolute left-4 top-4 text-gray-400"
                    />

                    <input
                      type="text"
                      name="donorPhone"
                      value={formData.donorPhone}
                      onChange={handleInputChange}
                      placeholder="Enter mobile number"
                      className="w-full border rounded-xl pl-11 p-4 outline-none focus:ring-2 focus:ring-orange-500"
                    />

                  </div>
                </div>

                {/* ADDRESS */}

                <div>
                  <label className="block mb-2 font-medium">
                    Address
                  </label>

                  <div className="relative">

                    <MapPin
                      size={18}
                      className="absolute left-4 top-4 text-gray-400"
                    />

                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      className="w-full border rounded-xl pl-11 p-4 outline-none focus:ring-2 focus:ring-orange-500"
                    />

                  </div>
                </div>

              </div>

              {/* MESSAGE */}

              <div className="mt-6">

                <label className="block mb-2 font-medium">
                  Message (Optional)
                </label>

                <div className="relative">

                  <MessageSquare
                    size={18}
                    className="absolute left-4 top-4 text-gray-400"
                  />

                  <textarea
                    rows={5}
                    name="donorMessage"
                    value={formData.donorMessage}
                    onChange={handleInputChange}
                    placeholder="Leave a message for our team..."
                    className="w-full border rounded-xl pl-11 pt-4 p-4 outline-none resize-none focus:ring-2 focus:ring-orange-500"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR */}

          <div>

            <div className="sticky top-6">

              {/* SUMMARY CARD */}

              <div className="bg-white rounded-3xl shadow-sm border p-6 mb-6">

                <h2 className="text-2xl font-bold mb-5">
                  Donation Summary
                </h2>

                <div className="space-y-4">

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Campaign
                    </span>

                    <span className="font-semibold text-right">
                      Early Childhood Education
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Donation
                    </span>

                    <span className="text-2xl font-bold text-orange-600">
                      ₹
                      {formData.amount
                        ? Number(formData.amount).toLocaleString("en-IN")
                        : "0"}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Payment Mode
                    </span>

                    <span className="font-semibold">
                      {formData.paymentMode}
                    </span>

                  </div>

                </div>

              </div>

              {/* WHY DONATE */}

              <div className="bg-orange-500 text-white rounded-3xl p-6">

                <h3 className="text-xl font-bold mb-4">
                  Why Your Donation Matters?
                </h3>

                <ul className="space-y-3 text-orange-100">

                  <li>
                    ✓ Support quality early childhood education.
                  </li>

                  <li>
                    ✓ Train teachers across rural communities.
                  </li>

                  <li>
                    ✓ Improve classroom learning resources.
                  </li>

                  <li>
                    ✓ Help children receive better education opportunities.
                  </li>

                </ul>

              </div>

            </div>

          </div>

        </div>

      </div>
            {/* PAYMENT SECTION */}

      <div className="max-w-7xl mx-auto px-6 pb-16">

        <div className="bg-white rounded-3xl shadow-sm border p-8">

          <h2 className="text-3xl font-bold mb-8">
            Complete Your Donation
          </h2>

          {/* PAYMENT MODE */}

          <div className="grid md:grid-cols-2 gap-6 mb-8">

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  paymentMode: "UPI",
                }))
              }
              className={`border-2 rounded-2xl p-6 transition ${
                formData.paymentMode === "UPI"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-300"
              }`}
            >
              <h3 className="font-bold text-xl mb-2">
                UPI Payment
              </h3>

              <p className="text-gray-600">
                Google Pay, PhonePe, Paytm,
                BHIM UPI
              </p>

            </button>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  paymentMode: "Bank Transfer",
                }))
              }
              className={`border-2 rounded-2xl p-6 transition ${
                formData.paymentMode === "Bank Transfer"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-300"
              }`}
            >
              <h3 className="font-bold text-xl mb-2">
                Bank Transfer
              </h3>

              <p className="text-gray-600">
                IMPS / NEFT / RTGS
              </p>

            </button>

          </div>

          {/* UPI DETAILS */}

          {formData.paymentMode === "UPI" && (

            <div className="border rounded-2xl p-8 mb-8">

              <h3 className="font-bold text-2xl mb-6">
                Scan QR Code
              </h3>

              <div className="flex flex-col md:flex-row gap-8 items-center">

                <img
                  src="/qr-code.png"
                  alt="QR Code"
                  className="w-56 h-56 border rounded-xl"
                />

                <div>

                  <p className="mb-2">
                    <strong>UPI ID :</strong>
                  </p>

                  <div className="bg-gray-100 rounded-lg p-3 font-semibold mb-4">
                    spacecefoundation@okhdfcbank
                  </div>

                  <p>
                    Donate Amount
                  </p>

                  <h2 className="text-4xl font-bold text-orange-600">

                    ₹
                    {formData.amount
                      ? Number(formData.amount).toLocaleString("en-IN")
                      : "0"}

                  </h2>

                </div>

              </div>

            </div>

          )}

          {/* BANK DETAILS */}

          {formData.paymentMode === "Bank Transfer" && (

            <div className="border rounded-2xl p-8 mb-8">

              <h3 className="font-bold text-2xl mb-6">
                Bank Details
              </h3>

              <div className="grid md:grid-cols-2 gap-5">

                <div>

                  <label className="text-gray-500">
                    Account Name
                  </label>

                  <input
                    readOnly
                    value="SpacECE India Foundation"
                    className="w-full border rounded-xl p-4 mt-2 bg-gray-100"
                  />

                </div>

                <div>

                  <label className="text-gray-500">
                    Bank Name
                  </label>

                  <input
                    readOnly
                    value="State Bank of India"
                    className="w-full border rounded-xl p-4 mt-2 bg-gray-100"
                  />

                </div>

                <div>

                  <label className="text-gray-500">
                    Account Number
                  </label>

                  <input
                    readOnly
                    value="XXXXXXXXXXXXXX"
                    className="w-full border rounded-xl p-4 mt-2 bg-gray-100"
                  />

                </div>

                <div>

                  <label className="text-gray-500">
                    IFSC Code
                  </label>

                  <input
                    readOnly
                    value="SBIN0001234"
                    className="w-full border rounded-xl p-4 mt-2 bg-gray-100"
                  />

                </div>

              </div>

            </div>

          )}

          {/* TRANSACTION ID */}

          <div className="mb-8">

            <label className="block mb-2 font-semibold">
              Transaction ID *
            </label>

            <input
              type="text"
              name="transactionId"
              value={formData.transactionId}
              onChange={handleInputChange}
              placeholder="Enter transaction reference"
              className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-orange-500 outline-none"
            />

          </div>

          {/* SCREENSHOT */}

          <div className="mb-8">

            <label className="block mb-2 font-semibold">
              Upload Payment Screenshot *
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotChange}
              className="w-full border rounded-xl p-4"
            />

            {preview && (

              <img
                src={preview}
                alt="preview"
                className="mt-5 w-72 rounded-xl border"
              />

            )}

          </div>

          {/* BUTTON */}

          <button
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-5 text-lg font-bold transition"
          >

            {loading
              ? "Submitting Donation..."
              : "Proceed To Donate"}

          </button>

        </div>

      </div>

    </div>
  );
};

export default DonatePage;