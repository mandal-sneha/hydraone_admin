import jwt from "jsonwebtoken"

export const generateAdminKeyToken = (key) => {
  return jwt.sign(
    {
      key: key.key,
      adminLevel: key.adminLevel,
      district: key.district || "",
      municipality: key.municipality || "",
      state: key.state || ""
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )
}