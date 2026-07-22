import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import DonationHeroBanner from "../components/common/donation/DonationHeroBanner";
import DonationForm from "../components/common/donation/DonationForm";
import DonationSummary from "../components/common/donation/DonationSummary";
import CampaignOverview from "../components/common/donation/CampaignOverview";
import CampaignMilestones from "../components/common/donation/CampaignMilestones";
import {
  fetchCampaigns,
  getCampaignDetails,
  calculateCampaignStats,
} from "../services/campaignService";
import { submitPublicDonation } from "../services/donationService";
import {
  createInitialFormState,
  validateDonationForm,
  preparePayload,
  parseBackendError,
} from "../utils/donationForm";

function CampaignState({ type, message, onRetry }) {
  const isError = type === "error";

  return (
    <div className="mx-auto flex min-h-[360px] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className={isError ? "mb-4 text-brand-danger" : "mb-4 text-brand-orange"}>
        {isError ? (
          <AlertCircle size={32} aria-hidden="true" />
        ) : (
          <Loader2 size={32} className="animate-spin" aria-hidden="true" />
        )}
      </div>
      <h1 className="font-display text-2xl font-bold text-brand-dark">
        {isError ? "Donation page unavailable" : "Loading campaigns"}
      </h1>
      <p className="mt-2 text-sm text-brand-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:border-brand-orange hover:text-brand-orange"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default function DonatePage() {
  const { campaignId: routeCampaignId } = useParams();
  const navigate = useNavigate();
  const formSectionRef = useRef(null);
  const formRef = useRef(null);

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [formData, setFormData] = useState(createInitialFormState);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const lockCampaign = Boolean(routeCampaignId);

  const stats = useMemo(
    () => (selectedCampaign ? calculateCampaignStats(selectedCampaign) : null),
    [selectedCampaign],
  );

  const applyCampaign = useCallback((campaign) => {
    if (!campaign) {
      setSelectedCampaign(null);
      setMilestones([]);
      setFormData((prev) => ({
        ...prev,
        campaignId: "",
        campaignName: "",
      }));
      return;
    }

    setSelectedCampaign(campaign);
    setMilestones(Array.isArray(campaign.milestones) ? campaign.milestones : []);
    setFormData((prev) => ({
      ...prev,
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
    }));
  }, []);

  const loadCampaignData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const campaignList = await fetchCampaigns();
      setCampaigns(campaignList);

      if (routeCampaignId) {
        const detail = await getCampaignDetails(routeCampaignId);
        if (!detail) {
          applyCampaign(null);
          setLoadError("The selected campaign could not be found.");
          return;
        }

        applyCampaign(detail);
        setCampaigns((prev) => {
          const exists = prev.some((campaign) => campaign.campaignId === detail.campaignId);
          return exists
            ? prev.map((campaign) => (campaign.campaignId === detail.campaignId ? detail : campaign))
            : [detail, ...prev];
        });
      } else {
        applyCampaign(null);
      }
    } catch (error) {
      setCampaigns([]);
      applyCampaign(null);
      setLoadError(error?.response?.data?.message || "Unable to load campaigns right now.");
    } finally {
      setIsLoading(false);
    }
  }, [applyCampaign, routeCampaignId]);

  useEffect(() => {
    loadCampaignData();
  }, [loadCampaignData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (field === "campaignId") {
      const campaign = campaigns.find((c) => c.campaignId === value);
      applyCampaign(campaign || null);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validateDonationForm(formData, campaigns);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = preparePayload(formData);
      const response = await submitPublicDonation(payload);
      const result = response?.data?.data ?? response?.data ?? {};
      navigate("/thank-you", {
        state: {
          donorName: formData.name,
          amount: formData.amount,
          campaignName: formData.campaignName,
          transactionId: result?.transactionId ?? formData.transactionId,
        },
      });
    } catch (error) {
      setSubmitError(parseBackendError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = selectedCampaign?.campaignName ?? "Support our campaign";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* user cancelled share */
    }
  };

  if (isLoading) {
    return (
      <CampaignState message="Fetching available campaigns for the donation form." />
    );
  }

  if (loadError) {
    return (
      <CampaignState
        type="error"
        message={loadError}
        onRetry={loadCampaignData}
      />
    );
  }

  if (campaigns.length === 0) {
    return (
      <CampaignState
        type="error"
        message="There are no campaigns available for donation right now."
        onRetry={loadCampaignData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-16 sm:pb-20">
      <DonationHeroBanner
        campaign={selectedCampaign}
        stats={stats}
        onDonateClick={scrollToForm}
        onShare={handleShare}
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:space-y-12 sm:px-6 lg:space-y-14 lg:px-8">
        {selectedCampaign && stats && (
          <>
            <CampaignOverview stats={stats} />

            {milestones.length > 0 && (
              <CampaignMilestones milestones={milestones} />
            )}
          </>
        )}

        <section
          id="donation-form"
          ref={formSectionRef}
          className="scroll-mt-24"
          aria-labelledby="donation-form-heading"
        >
          <div className="mb-8 lg:mb-10">
            <h2
              id="donation-form-heading"
              className="font-display text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl lg:text-4xl"
            >
              Make Your Donation
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-muted sm:text-base">
              Complete the form below to contribute to an available campaign.
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
            <div className="lg:col-span-7 xl:col-span-8">
              <DonationForm
                campaigns={campaigns}
                formData={formData}
                errors={errors}
                submitError={submitError}
                isSubmitting={isSubmitting}
                lockCampaign={lockCampaign}
                onFieldChange={handleFieldChange}
                onSubmit={onSubmit}
                formRef={formRef}
              />
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start xl:col-span-4">
              <DonationSummary
                formData={formData}
                campaign={selectedCampaign}
                stats={stats}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
