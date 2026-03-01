import mongoose from "mongoose";

const keySchema = new mongoose.Schema({
    key: {
        type: String,
        maxLength: 10,
        required: true,
        unique: true
    },
    adminName: {
        type: String,
        required: true
    },
    ward: {
        type:Number,
        required: true
    },
    municipality: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Key = mongoose.model("AdminKey", keySchema);