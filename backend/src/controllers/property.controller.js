import { Property } from "../models/property.model.js";
import { Key } from "../models/key.model.js";
import { User } from "../models/user.model.js";
import { WaterRegistration } from "../models/waterregistration.model.js";
import { Invitation } from "../models/invitation.model.js";

const LOCATION_DATA = {
  "West Bengal": {
    "Alipurduar": ["Alipurduar Municipality", "Falakata Municipality"],
    "Bankura": ["Bankura Municipality", "Bishnupur Municipality", "Sonamukhi Municipality"],
    "Birbhum": ["Suri Municipality", "Bolpur Municipality", "Rampurhat Municipality", "Sainthia Municipality", "Dubrajpur Municipality", "Nalhati Municipality"],
    "Cooch Behar": ["Cooch Behar Municipality", "Dinhata Municipality", "Mathabhanga Municipality", "Mekhliganj Municipality", "Haldibari Municipality", "Tufanganj Municipality"],
    "Dakshin Dinajpur": ["Balurghat Municipality", "Gangarampur Municipality"],
    "Darjeeling": ["Darjeeling Municipality", "Kurseong Municipality", "Mirik Municipality", "Siliguri Municipal Corporation"],
    "Hooghly": ["Chinsurah Municipality", "Chandannagar Municipal Corporation", "Serampore Municipality", "Baidyabati Municipality", "Bansberia Municipality", "Champdani Municipality", "Bhadreswar Municipality", "Rishra Municipality", "Konnagar Municipality", "Uttarpara-Kotrung Municipality", "Arambagh Municipality", "Tarakeswar Municipality"],
    "Howrah": ["Howrah Municipal Corporation", "Bally Municipality", "Uluberia Municipality"],
    "Jalpaiguri": ["Jalpaiguri Municipality", "Malbazar Municipality"],
    "Jhargram": ["Jhargram Municipality"],
    "Kalimpong": ["Kalimpong Municipality"],
    "Kolkata": ["Kolkata Municipal Corporation"],
    "Malda": ["English Bazar Municipality", "Old Malda Municipality"],
    "Murshidabad": ["Berhampore Municipality", "Jiaganj-Azimganj Municipality", "Kandi Municipality", "Murshidabad Municipality", "Jangipur Municipality", "Dhuliyan Municipality", "Beldanga Municipality"],
    "Nadia": ["Krishnanagar Municipality", "Nabadwip Municipality", "Shantipur Municipality", "Ranaghat Municipality", "Chakdaha Municipality", "Gayeshpur Municipality", "Haringhata Municipality", "Kalyani Municipality", "Taherpur Notified Area", "Birnagar Municipality"],
    "North 24 Parganas": ["Barasat Municipality", "Barrackpore Municipality", "Bhatpara Municipality", "Halisahar Municipality", "Kanchrapara Municipality", "Naihati Municipality", "Garulia Municipality", "North Barrackpur Municipality", "Titagarh Municipality", "Panihati Municipality", "Kamarhati Municipality", "Baranagar Municipality", "Dum Dum Municipality", "North Dum Dum Municipality", "South Dum Dum Municipality", "Bidhannagar Municipal Corporation", "Madhyamgram Municipality", "Habra Municipality", "Ashokenagar-Kalyangarh Municipality", "Gobardanga Municipality", "Basirhat Municipality", "Baduria Municipality", "Taki Municipality", "Bongaon Municipality"],
    "Paschim Bardhaman": ["Asansol Municipal Corporation", "Durgapur Municipal Corporation"],
    "Paschim Medinipur": ["Medinipur Municipality", "Kharagpur Municipality", "Ghatal Municipality", "Chandrakona Municipality", "Ramjibanpur Municipality", "Khirpai Municipality"],
    "Purba Bardhaman": ["Burdwan Municipality", "Kalna Municipality", "Katwa Municipality", "Memari Municipality", "Gushkara Municipality"],
    "Purba Medinipur": ["Tamluk Municipality", "Haldia Municipality", "Contai Municipality", "Egra Municipality", "Panskura Municipality"],
    "Purulia": ["Purulia Municipality", "Raghunathpur Municipality", "Jhalda Municipality"],
    "South 24 Parganas": ["Baruipur Municipality", "Budge Budge Municipality", "Diamond Harbour Municipality", "Jaynagar-Mazilpur Municipality", "Maheshtala Municipality", "Pujali Municipality", "Rajpur-Sonarpur Municipality"],
    "Uttar Dinajpur": ["Raiganj Municipality", "Islampur Municipality", "Kaliaganj Municipality"],
  },
};

const getStateContent = async (area) => {
  const admins = await Key.find({ state: area, adminLevel: "district" }).select("adminName district key");
  const districtNames = Object.keys(LOCATION_DATA[area] || {});

  const data = districtNames.map((district) => {
    const admin = admins.find((a) => a.district === district) || null;
    const municipalityCount = (LOCATION_DATA[area]?.[district] || []).length;
    return {
      district,
      municipalityCount,
      adminName: admin ? admin.adminName : null,
      adminKey: admin ? admin.key : null,
    };
  });

  return { count: data.length, data };
};

const getDistrictContent = async (area) => {
  const admins = await Key.find({ district: area, adminLevel: "municipality" }).select("adminName municipality key");

  const stateKey = Object.keys(LOCATION_DATA).find(
    (state) => LOCATION_DATA[state]?.[area] !== undefined
  );
  const municipalityNames = stateKey ? LOCATION_DATA[stateKey]?.[area] || [] : [];

  const data = municipalityNames.map((municipality) => {
    const admin = admins.find((a) => a.municipality === municipality) || null;
    return {
      municipality,
      adminName: admin ? admin.adminName : null,
      adminKey: admin ? admin.key : null,
    };
  });

  return { count: data.length, data };
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
  return { count: families.length, data: families };
};

export const getDashboardContent = async (req, res) => {
  try {
    const { areatype, area } = req.params;

    if (!areatype || !area) {
      return res.status(400).json({ success: false, message: "Area type and area name are required" });
    }

    let result;

    if (areatype === "state") {
      result = await getStateContent(area);
    } else if (areatype === "district") {
      result = await getDistrictContent(area);
    } else if (areatype === "municipality") {
      result = await getMunicipalityContent(area);
    } else {
      return res.status(400).json({ success: false, message: "Invalid area type" });
    }

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const members = await User.find({ waterId: waterid }).select("userName userId userProfilePhoto");

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
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWaterRegistrationDetailsForToday = async (req, res) => {
  try {
    const { waterid } = req.params;
    const registration = await WaterRegistration.findOne({ waterId: waterid });

    if (!registration) {
      return res.status(404).json({ success: false, message: "No water registration found for today" });
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFamilyMonthlyUsageDetails = async (req, res) => {
  try {
    const { waterid } = req.params;
  } catch (error) {}
};