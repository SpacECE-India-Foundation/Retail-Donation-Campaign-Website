function ThankYouPage() {
  return (
    <div className="min-h-screen bg-cream px-6 py-10 flex items-center justify-center">
      
      <div className="max-w-xl w-full bg-white rounded-xl shadow-md p-8 text-center">

        {/* Success icon placeholder */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary text-3xl">✓</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-dark mb-2">Thank You for Your Donation!</h1>
        <p className="text-gray-600 mb-6">
          Your contribution has been received and is being verified. You will receive 
          a confirmation email shortly with your donation details.
        </p>

        {/* Donation summary placeholder */}
        <div className="border rounded-lg p-4 mb-6 text-left text-sm text-gray-700">
          <p><strong>Amount:</strong> ₹1,000</p>
          <p><strong>Status:</strong> Pending verification</p>
          <p><strong>Transaction ID:</strong> XXXXXXXXXX</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button className="w-full bg-primary text-white rounded-lg py-3 font-medium">
            Download Certificate (available after verification)
          </button>
          <button className="w-full border border-primary text-primary rounded-lg py-3 font-medium">
            Share on WhatsApp
          </button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-6">
          Verification and certificate dispatch are usually completed within 48 hours.
        </p>

      </div>

    </div>
  );
}

export default ThankYouPage;