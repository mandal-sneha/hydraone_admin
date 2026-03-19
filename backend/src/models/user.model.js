import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },

    userId: {
        type: String,
        trim: true,
        required: true
    },

    userProfilePhoto: {
        type: String,
        required: true
    },

    verificationPhoto: {
        type: String,
        required: false
    },

    adhaarNumber: {
        type: Number,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    tenantCode: {
        type: String,
        required: false
    },

    properties: {
        type: [],
        required: false,
    },

    waterId: {
        type: String,
        required: false,
        default: ""
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    embeddingVector: {
        type: [],
        required: true 
    },

}, { timestamps: true });

export const User = mongoose.model("User", userSchema);