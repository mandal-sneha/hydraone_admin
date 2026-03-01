import jwt from "jsonwebtoken"
import { Key } from "../models/key.model.js"

export const protectAdminKey = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const keyData = await Key.findOne({ key: decoded.key })

      if (!keyData) {
        return res.status(401).json({ success: false, message: "Invalid admin key" })
      }

      req.adminKey = keyData
      next()

    } catch (error) {
      return res.status(401).json({ success: false, message: "Not authorized, token failed" })
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" })
  }
}