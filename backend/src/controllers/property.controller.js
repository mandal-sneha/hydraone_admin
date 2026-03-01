import { Property } from "../models/property.model.js";

export const getPropertyDetails = async (req, res) => {
  try {
    const { municipality } = req.params;

    if (!municipality) {
      return res.status(400).json({
        success: false,
        message: "Municipality is required",
      });
    }

    const properties = await Property.find({ municipality });

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};