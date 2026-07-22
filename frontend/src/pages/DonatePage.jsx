import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DonationHeroBanner from "../components/common/donation/DonationHeroBanner";
import DonationForm from "../components/common/donation/DonationForm";
import DonationSummary from "../components/common/donation/DonationSummary";
import CampaignOverview from "../components/common/donation/CampaignOverview";
import CampaignMilestones from "../components/common/donation/CampaignMilestones";
import { getCampaignDetails } from "../services/campaignService";
import { getCampaignMilestones } from "../services/milestoneService";
import {
  CAMPAIGNS,
  DEFAULT_HERO,
  getCampaignStats,
} from "../data/donation.mock";
import {
  createInitialFormState,
  validateDonationForm,
  preparePayload,
  handleSubmit,
  parseBackendError,
} from "../utils/donationForm";

export default function DonatePage() {
  const { campaignId: routeCampaignId } = useParams();
  const navigate = useNavigate();
  const formSectionRef = useRef(null);
  const formRef = useRef(null);

  const [campaigns] = useState(CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [formData, setFormData] = useState(createInitialFormState);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lockCampaign = Boolean(routeCampaignId);

  const stats = useMemo(
    () => (selectedCampaign ? getCampaignStats(selectedCampaign) : null),
    [selectedCampaign],
  );

  const applyCampaign = useCallback((campaign) => {
    if (!campaign) return;
    setSelectedCampaign(campaign);
    setFormData((prev) => ({
      ...prev,
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
    }));
  }, []);

  useEffect(() => {
    if (!routeCampaignId) return;

    const fromList = campaigns.find((c) => c.campaignId === routeCampaignId);
    if (fromList) {
      applyCampaign(fromList);
      return;
    }

    let cancelled = false;

    getCampaignDetails(routeCampaignId)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          applyCampaign(data);
        } else {
          applyCampaign(campaigns[0]);
        }
      })
      .catch(() => {
        if (!cancelled) applyCampaign(campaigns[0]);
      });

    return () => {
      cancelled = true;
    };
  }, [routeCampaignId, campaigns, applyCampaign]);

  useEffect(() => {
    if (!selectedCampaign?.campaignId) {
      setMilestones([]);
      return;
    }

    let cancelled = false;

    getCampaignMilestones(selectedCampaign.campaignId)
      .then((data) => {
        if (!cancelled) setMilestones(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setMilestones([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCampaign?.campaignId]);

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
      if (campaign) {
        setSelectedCampaign(campaign);
        setFormData((prev) => ({
          ...prev,
          campaignId: campaign.campaignId,
          campaignName: campaign.campaignName,
        }));
      }
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validateDonationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = preparePayload(formData);
      const result = await handleSubmit(payload);
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

  return (
    <div className="min-h-screen bg-brand-cream pb-16 sm:pb-20">
      <DonationHeroBanner
        campaign={selectedCampaign}
        defaultHero={DEFAULT_HERO}
        stats={stats}
        onDonateClick={scrollToForm}
        onShare={handleShare}
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:space-y-12 sm:px-6 lg:space-y-14 lg:px-8">
        {selectedCampaign && stats && (
          <>
            <CampaignOverview stats={stats} />

            <CampaignMilestones milestones={milestones} />
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
              Complete the form below to contribute. Every rupee goes directly
              toward the campaign&apos;s verified milestones.
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
