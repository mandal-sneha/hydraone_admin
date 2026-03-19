import mongoose from "mongoose";

const waterRegistrationSchema = new mongoose.Schema({
    waterId: {
        type: String,
        required: true
    },
    primaryMembers: {
        type: [String],
        required: true
    },
    specialMembers: {
        type: [String],
        default: []
    },
    invitedGuests: {
        type: [String],
        default: []
    },
    slot: {
        type: Number,
        required: true
    },
    extraWaterRequested: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

waterRegistrationSchema.index({ waterId: 1, slot: 1 }, { unique: true });

export const WaterRegistration = mongoose.model("WaterRegistration", waterRegistrationSchema);