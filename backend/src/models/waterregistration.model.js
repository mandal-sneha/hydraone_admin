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
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: {
        type: Date
    }
}, { timestamps: true });

waterRegistrationSchema.index({ waterId: 1, slot: 1 }, { unique: true });

export const WaterRegistration = mongoose.model("WaterRegistration", waterRegistrationSchema);