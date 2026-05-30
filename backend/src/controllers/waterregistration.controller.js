import { WaterRegistration } from "../models/waterregistration.model.js";
import { Property } from "../models/property.model.js";
import { User } from "../models/user.model.js";
import { Invitation } from "../models/invitation.model.js";
import { sendWaterRequestApprovalEmail, sendWaterRequestRejectionEmail, sendWaterRequestStatusUpdateToHost } from "../services/email.service.js";

export const getPendingWaterRequests = async (req, res) => {
  try {
    const { municipality } = req.query;
    
    const query = { status: "pending" };
    if (municipality) {
      const properties = await Property.find({ municipality });
      const waterIds = properties.flatMap(p => p.families || []);
      query.waterId = { $in: waterIds };
    }
    
    const registrations = await WaterRegistration.find(query)
      .sort({ submittedAt: -1 });
    
    const requestsWithDetails = [];
    
    for (const reg of registrations) {
      const [rootId] = reg.waterId.split("_");
      const property = await Property.findOne({ rootId });
      
      if (!property) continue;
      
      if (municipality && property.municipality !== municipality) continue;
      
      const primaryUsers = await User.find({
        userId: { $in: reg.primaryMembers }
      }).select("userId userName userProfilePhoto email");
      
      const invitation = await Invitation.findOne({ hostwaterId: reg.waterId });
      
      let invitedGuestsList = [];
      
      if (invitation && invitation.invitedGuests && invitation.invitedGuests.size > 0) {
        const guestUserIds = Array.from(invitation.invitedGuests.keys());
        const invitedGuestUsers = await User.find({
          userId: { $in: guestUserIds }
        }).select("userId userName userProfilePhoto email");
        
        for (const guest of invitedGuestUsers) {
          const status = invitation.invitedGuests?.get(guest.userId) || "pending";
          const arrivalTime = invitation.arrivalTime?.get(guest.userId) || null;
          const stayDuration = invitation.stayDuration?.get(guest.userId) || null;
          
          invitedGuestsList.push({
            userId: guest.userId,
            userName: guest.userName,
            userProfilePhoto: guest.userProfilePhoto,
            email: guest.email,
            status: status,
            arrivalTime: arrivalTime,
            stayDuration: stayDuration
          });
        }
      }
      
      requestsWithDetails.push({
        _id: reg._id,
        waterId: reg.waterId,
        propertyName: property.propertyName,
        municipality: property.municipality,
        district: property.district,
        state: property.state,
        wardNumber: property.wardNumber,
        propertyId: property.id,
        exactLocation: property.exactLocation,
        slot: reg.slot,
        extraWaterRequested: reg.extraWaterRequested,
        primaryMembers: primaryUsers,
        invitedGuests: invitedGuestsList,
        status: reg.status,
        submittedAt: reg.submittedAt,
        respondedAt: reg.respondedAt,
        rejectionReason: reg.rejectionReason
      });
    }
    
    return res.status(200).json({
      success: true,
      data: requestsWithDetails,
      count: requestsWithDetails.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getWaterRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const registration = await WaterRegistration.findById(requestId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }
    
    const [rootId] = registration.waterId.split("_");
    const property = await Property.findOne({ rootId });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }
    
    const primaryUsers = await User.find({
      userId: { $in: registration.primaryMembers }
    }).select("userId userName userProfilePhoto email");
    
    const hostUser = await User.findOne({ waterId: registration.waterId });
    
    const invitation = await Invitation.findOne({ hostwaterId: registration.waterId });
    
    let invitedGuestsList = [];
    
    if (invitation && invitation.invitedGuests && invitation.invitedGuests.size > 0) {
      const guestUserIds = Array.from(invitation.invitedGuests.keys());
      const invitedGuestUsers = await User.find({
        userId: { $in: guestUserIds }
      }).select("userId userName userProfilePhoto email");
      
      for (const guest of invitedGuestUsers) {
        const guestObj = guest.toObject();
        guestObj.arrivalTime = invitation.arrivalTime?.get(guest.userId) || null;
        guestObj.stayDuration = invitation.stayDuration?.get(guest.userId) || null;
        guestObj.status = invitation.invitedGuests?.get(guest.userId) || "pending";
        invitedGuestsList.push(guestObj);
      }
    }
    
    return res.status(200).json({
      success: true,
      data: {
        _id: registration._id,
        waterId: registration.waterId,
        propertyDetails: {
          propertyName: property.propertyName,
          municipality: property.municipality,
          district: property.district,
          state: property.state,
          wardNumber: property.wardNumber,
          propertyId: property.id,
          exactLocation: property.exactLocation
        },
        slot: registration.slot,
        extraWaterRequested: registration.extraWaterRequested,
        primaryMembers: primaryUsers,
        invitedGuests: invitedGuestsList,
        status: registration.status,
        submittedAt: registration.submittedAt,
        respondedAt: registration.respondedAt,
        rejectionReason: registration.rejectionReason,
        hostEmail: hostUser?.email,
        hostName: hostUser?.userName,
        hostUserId: hostUser?.userId
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const approveWaterRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const registration = await WaterRegistration.findById(requestId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }
    
    if (registration.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${registration.status}`
      });
    }
    
    registration.status = "approved";
    registration.respondedAt = new Date();
    await registration.save();
    
    const [rootId] = registration.waterId.split("_");
    const property = await Property.findOne({ rootId });
    
    const primaryMembers = await User.find({
      userId: { $in: registration.primaryMembers }
    }).select("email userName userId");
    
    const invitation = await Invitation.findOne({ hostwaterId: registration.waterId });
    
    let invitedGuests = [];
    let guestList = [];
    
    if (invitation && invitation.invitedGuests && invitation.invitedGuests.size > 0) {
      const guestUserIds = Array.from(invitation.invitedGuests.keys());
      invitedGuests = await User.find({
        userId: { $in: guestUserIds }
      }).select("email userName userId");
      guestList = invitedGuests.map(g => ({ userName: g.userName, userId: g.userId }));
    }
    
    const hostUser = await User.findOne({ waterId: registration.waterId })
      .select("email userName userId");

    for (const member of primaryMembers) {
      if (member.email) {
        await sendWaterRequestApprovalEmail(
          member.email,
          member.userName,
          property?.propertyName || "Your Property",
          registration.waterId,
          registration.slot,
          registration.extraWaterRequested,
          null,
          null,
          guestList
        );
      }
    }
    
    for (const guest of invitedGuests) {
      if (guest.email) {
        await sendWaterRequestApprovalEmail(
          guest.email,
          guest.userName,
          property?.propertyName || "Your Property",
          registration.waterId,
          registration.slot,
          registration.extraWaterRequested,
          hostUser?.userName || null,
          hostUser?.userId || null,
          []
        );
      }
    }
    
    if (hostUser && hostUser.email) {
      await sendWaterRequestStatusUpdateToHost(
        hostUser.email,
        hostUser.userName,
        hostUser.userId,
        guestList,
        property?.propertyName || "Your Property",
        "approved"
      );
    }
    
    return res.status(200).json({
      success: true,
      message: "Water request approved and emails sent successfully"
    });
  } catch (error) {
    console.error("Error in approveWaterRequest:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const rejectWaterRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const registration = await WaterRegistration.findById(requestId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }
    
    if (registration.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${registration.status}`
      });
    }
    
    registration.status = "rejected";
    registration.rejectionReason = "Request rejected by administrator";
    registration.respondedAt = new Date();
    await registration.save();
    
    const [rootId] = registration.waterId.split("_");
    const property = await Property.findOne({ rootId });
    
    const primaryMembers = await User.find({
      userId: { $in: registration.primaryMembers }
    }).select("email userName userId");
    
    const invitation = await Invitation.findOne({ hostwaterId: registration.waterId });
    
    let invitedGuests = [];
    let guestList = [];
    
    if (invitation && invitation.invitedGuests && invitation.invitedGuests.size > 0) {
      const guestUserIds = Array.from(invitation.invitedGuests.keys());
      invitedGuests = await User.find({
        userId: { $in: guestUserIds }
      }).select("email userName userId");
      guestList = invitedGuests.map(g => ({ userName: g.userName, userId: g.userId }));
    }
    
    const hostUser = await User.findOne({ waterId: registration.waterId })
      .select("email userName userId");

    for (const member of primaryMembers) {
      if (member.email) {
        await sendWaterRequestRejectionEmail(
          member.email,
          member.userName,
          property?.propertyName || "Your Property",
          registration.waterId,
          null,
          null,
          guestList
        );
      }
    }
    
    for (const guest of invitedGuests) {
      if (guest.email) {
        await sendWaterRequestRejectionEmail(
          guest.email,
          guest.userName,
          property?.propertyName || "Your Property",
          registration.waterId,
          hostUser?.userName || null,
          hostUser?.userId || null,
          []
        );
      }
    }
    
    if (hostUser && hostUser.email) {
      await sendWaterRequestStatusUpdateToHost(
        hostUser.email,
        hostUser.userName,
        hostUser.userId,
        guestList,
        property?.propertyName || "Your Property",
        "rejected"
      );
    }
    
    return res.status(200).json({
      success: true,
      message: "Water request rejected and emails sent successfully"
    });
  } catch (error) {
    console.error("Error in rejectWaterRequest:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};