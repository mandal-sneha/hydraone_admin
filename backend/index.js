import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ConnectDB } from "./src/lib/db.js";

import authRoutes from "./src/routes/auth.route.js";
import propertyRoutes from "./src/routes/property.route.js";
import waterRegistrationRoutes from "./src/routes/waterregistration.route.js";

const app = express();

dotenv.config();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/water-requests", waterRegistrationRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    ConnectDB();
});