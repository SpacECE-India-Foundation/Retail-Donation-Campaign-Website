import Campaign from "../models/campaign.modals.js";
import syncMilestoneCompletion from "../controllers/adminOpeartions/donation.adminOperations.controller.js";


//-----------------------------------------------------THIS IS THE VERIFICATION SERVICES IMPLEMENTATION---------------------------------
class VerificationService {


    //---------------------------------------------THE DONATION VERIFICATION SERVICE------------------------------------------
    async verifyDonation({
        //HERE, we are takking the actual donation, campaign that donation belongs verified by 
        donation,
        campaign,
        verifiedBy,
        session
    }) {
        //here, we will be updating the particular donation record with all the verified conditions 
        donation.status = "Verified";
        donation.verified = true;
        donation.verifiedBy = verifiedBy;
        donation.verifiedAt = new Date();
        await donation.save({ session }); //here, we are saving the donation now 
        //now we will be updating the campaign details based on the verification success

        await Campaign.findByIdAndUpdate(
            campaign._id,
            {
                $inc: {
                    campaignRaisedAmt: donation.amount,
                    contributors: 1
                }
            },
            {
                session
            }
        );
        //till here, the campaign updation is achieved 

        //now we will be updating the milestones 
        await syncMilestoneCompletion(
            campaign._id,
            session
        );

        return {
            donation,
            campaign
        };

    }

}

export default new VerificationService();