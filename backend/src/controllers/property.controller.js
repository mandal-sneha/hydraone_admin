import { Property } from "../models/property.model.js";
import { User } from "../models/user.model.js";
import { WaterRegistration } from "../models/waterregistration.model.js";
import { Invitation } from "../models/invitation.model.js";

const getStateContent = async (area) => {
  const districts = await Property.distinct("district", { state: area });
  return {
    count: districts.length,
    data: districts,
  };
};

const getDistrictContent = async (area) => {
  const municipalities = await Property.distinct("municipality", { district: area });
  return {
    count: municipalities.length,
    data: municipalities,
  };
};

const getMunicipalityContent = async (area) => {
  const properties = await Property.find({ municipality: area });
  const families = properties.flatMap((property) =>
    property.families.map((waterId) => ({
      waterId,
      propertyName: property.propertyName,
      wardNumber: property.wardNumber,
    }))
  );
  return {
    count: families.length,
    data: families,
  };
};

export const getDashboardContent = async (req, res) => {
  try {
    const { areatype, area } = req.params;

    if (!areatype || !area) {
      return res.status(400).json({
        success: false,
        message: "Area type and area name are required",
      });
    }

    let result;

    if (areatype === "state") {
      result = await getStateContent(area);
    } else if (areatype === "district") {
      result = await getDistrictContent(area);
    } else if (areatype === "municipality") {
      result = await getMunicipalityContent(area);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid area type",
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFamilyDetails = async (req, res) => {
  try {
    const { waterid } = req.params;

    const rootId = waterid.split("_")[0];

    const property = await Property.findOne({ rootId }).select(
      "wardNumber municipality district typeOfProperty id numberOfTenants"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const members = await User.find({ waterId: waterid }).select(
      "userName userId userProfilePhoto"
    );

    return res.status(200).json({
      success: true,
      data: {
        property: {
          wardNumber: property.wardNumber,
          municipality: property.municipality,
          district: property.district,
          typeOfProperty: property.typeOfProperty,
          id: property.id,
          numberOfTenants: property.numberOfTenants,
        },
        members,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWaterRegistrationDetailsForToday = async (req, res) => {
  try {
    const { waterid } = req.params;

    const registration = await WaterRegistration.findOne({ waterId: waterid });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "No water registration found for today",
      });
    }

    const primaryUsers = await User.find({
      userId: { $in: registration.primaryMembers },
    }).select("userId userName");

    const specialMemberSet = new Set(registration.specialMembers);

    const members = primaryUsers.map((user) => ({
      userId: user.userId,
      userName: user.userName,
      isSpecial: specialMemberSet.has(user.userId),
    }));

    const guestDetails = [];

    for (const guestId of registration.invitedGuests) {
      const invitation = await Invitation.findOne({
        [`invitedGuests.${guestId}`]: { $exists: true },
        hostwaterId: waterid,
      });

      if (!invitation) continue;

      const status = invitation.invitedGuests.get(guestId);
      if (status !== "accepted" && status !== "arrived") continue;

      const guestUser = await User.findOne({ userId: guestId }).select("userId userName");
      if (!guestUser) continue;

      guestDetails.push({
        userId: guestUser.userId,
        userName: guestUser.userName,
        arrivalTime: invitation.arrivalTime?.get(guestId) ?? null,
        stayDuration: invitation.stayDuration?.get(guestId) ?? null,
        status,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        slot: registration.slot,
        extraWaterRequested: registration.extraWaterRequested,
        members,
        guests: guestDetails,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFamilyMonthlyUsageDetails = async(req, res) => {
  try {
    const { waterid } = req.params;

    
  } catch (error) {
    
  }
};