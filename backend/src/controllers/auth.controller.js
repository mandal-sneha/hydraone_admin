import { Key } from "../models/key.model.js"
import { generateAdminKeyToken } from "../utils/generate.token.js"

export const verifyAdminKey = async (req, res) => {
  try {
    const { adminKey } = req.body

    if (!adminKey) {
      return res.status(400).json({
        success: false,
        message: "Admin key is required"
      })
    }

    const keyDetails = await Key.findOne({ key: adminKey })

    if (!keyDetails) {
      return res.status(404).json({
        success: false,
        message: "Invalid admin key"
      })
    }

    const token = generateAdminKeyToken(keyDetails)

    return res.status(200).json({
      success: true,
      message: "Admin key verified successfully",
      token,
      data: {
        key: keyDetails.key,
        adminLevel: keyDetails.adminLevel,
        adminName: keyDetails.adminName,
        municipality: keyDetails.municipality,
        district: keyDetails.district,
        state: keyDetails.state,
      }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}