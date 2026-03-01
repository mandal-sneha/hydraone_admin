import jwt from "jsonwebtoken"

export const generateAdminKeyToken = (key) => {
  return jwt.sign(
    { key: key.key },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  )
}