import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 1. Verify the token structure and secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 2. Fetch admin from DB (standard check)
      const admin = await Admin.findById(decoded.id).select("-password");
      
      if (!admin) {
        return res.status(401).json({ message: "Admin no longer exists" });
      }

      // 3. THE SECURITY MASTER KEY: Check tokenVersion
      // If password was changed, decoded.tokenVersion will be older than admin.tokenVersion
      if (decoded.tokenVersion !== admin.tokenVersion) {
        return res.status(401).json({ 
          message: "Security alert: Password was changed. Please log in again." 
        });
      }

      // 4. Attach admin to the request object for use in next routes
      req.admin = admin;
      next();
    } catch (err) {
      console.error("Auth Middleware Error:", err.message);
      
      // Specific error messaging
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired" });
      }
      
      return res.status(401).json({ message: "Invalid or corrupted token" });
    }
  } else {
    return res.status(401).json({ message: "Authentication required" });
  }
};

export default protectAdmin;