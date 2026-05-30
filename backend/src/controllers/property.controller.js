import { Property } from "../models/property.model.js";
import { Family } from "../models/family.model.js";
import { User } from "../models/user.model.js";
import { EntryExitLog } from "../models/entryexitlog.model.js";
import { Key } from "../models/key.model.js";
import { WaterRegistration } from "../models/waterregistration.model.js";
import { Invitation } from "../models/invitation.model.js";
import { LOCATION_DATA } from "../lib/locationData.js";
import moment from "moment-timezone";

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
    const tenantCode = waterid.split("_")[1];

    const property = await Property.findOne({ rootId }).select(
      "wardNumber municipality district typeOfProperty id numberOfTenants"
    );

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const family = await Family.findOne({ rootId, tenantCode });
    if (!family) {
      const newFamily = new Family({
        rootId,
        tenantCode,
        members: [],
        waterUsage: new Map(),
        extraWaterDates: new Map(),
        fineDates: [],
        payments: []
      });
      await newFamily.save();
    }

    const members = await User.find({ waterId: waterid }).select("userName userId userProfilePhoto");

    const propertyObj = property.toObject({ virtuals: false });

    return res.status(200).json({
      success: true,
      data: {
        property: {
          wardNumber: propertyObj.wardNumber,
          municipality: propertyObj.municipality,
          district: propertyObj.district,
          typeOfProperty: propertyObj.typeOfProperty,
          id: propertyObj.id,
          numberOfTenants: propertyObj.numberOfTenants,
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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const registration = await WaterRegistration.findOne({
      waterId: waterid,
      submittedAt: { $gte: todayStart, $lte: todayEnd },
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: "No water registration found for today" });
    }

    if (registration.status !== "approved") {
      return res.status(200).json({
        success: true,
        data: {
          slot: registration.slot,
          extraWaterRequested: registration.extraWaterRequested,
          members: [],
          guests: [],
          status: registration.status,
          message: "Registration pending approval"
        },
      });
    }

    const primaryUsers = await User.find({
      userId: { $in: registration.primaryMembers },
    }).select("userId userName userProfilePhoto email");

    const specialMemberSet = new Set(registration.specialMembers);

    const members = primaryUsers.map((user) => ({
      userId: user.userId,
      userName: user.userName,
      userProfilePhoto: user.userProfilePhoto,
      isSpecial: specialMemberSet.has(user.userId),
    }));

    const guestDetails = [];

    if (registration.invitedGuests && registration.invitedGuests.length > 0) {
      const invitation = await Invitation.findOne({
        hostwaterId: waterid,
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });

      for (const guestId of registration.invitedGuests) {
        const guestStatus = invitation?.invitedGuests?.get(guestId) || "pending";

        if (guestStatus === "declined") continue;

        const arrivalTime = invitation?.arrivalTime?.get(guestId) || null;
        const stayDuration = invitation?.stayDuration?.get(guestId) || null;

        const guestUser = await User.findOne({ userId: guestId }).select("userId userName userProfilePhoto email");
        if (guestUser) {
          guestDetails.push({
            userId: guestUser.userId,
            userName: guestUser.userName,
            userProfilePhoto: guestUser.userProfilePhoto,
            email: guestUser.email,
            arrivalTime,
            stayDuration,
            status: guestStatus,
          });
        } else {
          guestDetails.push({
            userId: guestId,
            userName: "Unknown User",
            userProfilePhoto: null,
            email: null,
            arrivalTime,
            stayDuration,
            status: guestStatus,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        slot: registration.slot,
        extraWaterRequested: registration.extraWaterRequested,
        members,
        guests: guestDetails,
        status: registration.status,
      },
    });
  } catch (error) {
    console.error("Error in getWaterRegistrationDetailsForToday:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFamilyMonthlyUsageDetails = async (req, res) => {
  try {
    const { waterid } = req.params;
    const [rootId, tenantCode] = waterid.split("_");

    let family = await Family.findOne({ rootId, tenantCode });

    if (!family) {
      family = new Family({
        rootId,
        tenantCode,
        members: [],
        waterUsage: new Map(),
        extraWaterDates: new Map(),
        fineDates: [],
        payments: []
      });
      await family.save();
    }

    const entryExitLogs = await EntryExitLog.find({ waterId: waterid });
    const invitations = await Invitation.find({ hostwaterId: waterid });
    const currentYear = new Date().getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const result = {};

    monthNames.forEach(m => {
      result[m] = { days: [], totalUsage: 0, totalFines: 0 };
    });

    let waterUsageMap;
    if (family.waterUsage instanceof Map) {
      waterUsageMap = family.waterUsage;
    } else if (typeof family.waterUsage === 'object' && family.waterUsage !== null) {
      waterUsageMap = new Map(Object.entries(family.waterUsage));
    } else {
      waterUsageMap = new Map();
    }

    const fineDatesSet = new Set(family.fineDates || []);

    const fraudDetailsByDate = new Map();

    for (const log of entryExitLogs) {
      const logDate = new Date(log.createdAt);

      let fraudEntriesMap;
      if (log.fraudEntries instanceof Map) {
        fraudEntriesMap = log.fraudEntries;
      } else if (log.fraudulentGuests instanceof Map) {
        fraudEntriesMap = log.fraudulentGuests;
      } else if (typeof log.fraudEntries === 'object' && log.fraudEntries !== null) {
        fraudEntriesMap = new Map(Object.entries(log.fraudEntries));
      } else if (typeof log.fraudulentGuests === 'object' && log.fraudulentGuests !== null) {
        fraudEntriesMap = new Map(Object.entries(log.fraudulentGuests));
      } else {
        continue;
      }

      for (const [guestId, fraudData] of fraudEntriesMap.entries()) {
        const fraudDate = fraudData.detectedAt ? new Date(fraudData.detectedAt) : logDate;
        const fraudDateStr = fraudDate.toISOString().split('T')[0];

        if (!fraudDetailsByDate.has(fraudDateStr)) {
          fraudDetailsByDate.set(fraudDateStr, []);
        }

        const guestUser = await User.findOne({ userId: guestId });
        fraudDetailsByDate.get(fraudDateStr).push({
          guestName: guestUser ? guestUser.userName : "Unknown Guest",
          guestId: guestId,
          scheduledExit: fraudData.scheduledExit || "N/A",
          actualExit: fraudData.actualExit || "Early Exit",
          fine: 500
        });
      }
    }

    for (const fineDate of fineDatesSet) {
      if (!fraudDetailsByDate.has(fineDate)) {
        const date = new Date(fineDate);
        if (date.getFullYear() === currentYear && !isNaN(date.getTime())) {
          let foundGuests = [];

          for (const invitation of invitations) {
            if (invitation.arrivalTime && invitation.arrivalTime.size > 0) {
              for (const [guestId, arrivalTime] of invitation.arrivalTime.entries()) {
                const guestUser = await User.findOne({ userId: guestId });
                if (guestUser) {
                  const stayDuration = invitation.stayDuration?.get(guestId) || "2";
                  const durationHours = parseInt(stayDuration);

                  let scheduledExitTime = "N/A";
                  if (arrivalTime) {
                    const [time, modifier] = arrivalTime.split(" ");
                    let [hours, minutes] = time.split(":");
                    let hourNum = parseInt(hours);

                    if (modifier === "PM" && hourNum !== 12) hourNum += 12;
                    if (modifier === "AM" && hourNum === 12) hourNum = 0;

                    hourNum += durationHours;
                    const newModifier = hourNum >= 12 ? "PM" : "AM";
                    if (hourNum > 12) hourNum -= 12;
                    if (hourNum === 0) hourNum = 12;

                    scheduledExitTime = `${hourNum}:${minutes || "00"} ${newModifier}`;
                  }

                  foundGuests.push({
                    guestName: guestUser.userName,
                    guestId: guestId,
                    scheduledExit: scheduledExitTime,
                    actualExit: "Early Exit",
                    fine: 500
                  });
                }
              }
            }
          }

          if (foundGuests.length > 0) {
            fraudDetailsByDate.set(fineDate, foundGuests);
          } else {
            fraudDetailsByDate.set(fineDate, [{
              guestName: "Unknown Guest",
              guestId: "unknown",
              scheduledExit: "N/A",
              actualExit: "Early Exit",
              fine: 500
            }]);
          }
        }
      }
    }

    const allDatesWithData = new Set();

    for (const [dateStr, usage] of waterUsageMap.entries()) {
      allDatesWithData.add(dateStr);
      const date = new Date(dateStr);
      if (date.getFullYear() === currentYear && !isNaN(date.getTime())) {
        const mName = monthNames[date.getMonth()];
        const dayNum = date.getDate();

        let guestCount = 0;
        for (const log of entryExitLogs) {
          const logDate = new Date(log.createdAt);
          const logDateStr = logDate.toISOString().split('T')[0];
          if (logDateStr === dateStr) {
            if (Array.isArray(log.arrivedGuests)) {
              guestCount = log.arrivedGuests.length;
            } else if (log.arrivedGuests && typeof log.arrivedGuests === 'object') {
              guestCount = Object.values(log.arrivedGuests).length;
            }
            break;
          }
        }

        const hasFine = fineDatesSet.has(dateStr);

        let fraudulentGuests = [];
        if (hasFine && fraudDetailsByDate.has(dateStr)) {
          fraudulentGuests = fraudDetailsByDate.get(dateStr);
        }

        const normalGuestsCount = Math.max(0, guestCount - fraudulentGuests.length);
        const fineAmount = hasFine ? (fraudulentGuests.length > 0 ? fraudulentGuests.length * 500 : 500) : 0;

        result[mName].days.push({
          date: dayNum,
          waterUsed: usage,
          normalGuests: normalGuestsCount,
          fraudulentGuests: fraudulentGuests,
          hasFine: hasFine,
          fineAmount: fineAmount
        });

        result[mName].totalUsage += usage;
        if (hasFine) {
          result[mName].totalFines += 1;
        }
      }
    }

    for (const [dateStr, fraudGuests] of fraudDetailsByDate.entries()) {
      if (!allDatesWithData.has(dateStr)) {
        const date = new Date(dateStr);
        if (date.getFullYear() === currentYear && !isNaN(date.getTime())) {
          const mName = monthNames[date.getMonth()];
          const dayNum = date.getDate();

          const existingDay = result[mName].days.find(d => d.date === dayNum);
          if (!existingDay) {
            result[mName].days.push({
              date: dayNum,
              waterUsed: 0,
              normalGuests: 0,
              fraudulentGuests: fraudGuests,
              hasFine: true,
              fineAmount: fraudGuests.length * 500
            });
            result[mName].totalFines += 1;
          } else if (existingDay.hasFine === false) {
            existingDay.hasFine = true;
            existingDay.fraudulentGuests = fraudGuests;
            existingDay.fineAmount = fraudGuests.length * 500;
            existingDay.normalGuests = Math.max(0, existingDay.normalGuests);
            result[mName].totalFines += 1;
          }
        }
      }
    }

    for (const monthName of monthNames) {
      const monthData = result[monthName];
      if (monthData.totalFines > 0 && monthData.days.filter(d => d.hasFine).length === 0 && monthData.days.length > 0) {
        const fineDaysToAdd = Math.min(monthData.totalFines, monthData.days.length);

        for (let i = 0; i < fineDaysToAdd && i < monthData.days.length; i++) {
          if (!monthData.days[i].hasFine) {
            monthData.days[i].hasFine = true;
            monthData.days[i].fineAmount = 500;
            monthData.days[i].fraudulentGuests = [{
              guestName: "Unknown Guest",
              guestId: "unknown",
              scheduledExit: "N/A",
              actualExit: "Early Exit",
              fine: 500
            }];
            monthData.days[i].normalGuests = Math.max(0, monthData.days[i].normalGuests);
          }
        }
      }
    }

    Object.keys(result).forEach(m => {
      result[m].days.sort((a, b) => a.date - b.date);
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error in getFamilyMonthlyUsageDetails:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const viewProperties = async (req, res) => {
  try {
    const { state, district, municipality } = req.query;
    const query = {};
    if (state) query.state = state;
    if (district) query.district = district;
    if (municipality) query.municipality = municipality;

    const properties = await Property.find(query);
    return res.status(200).json({ success: true, properties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};