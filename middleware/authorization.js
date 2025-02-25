// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
// dotenv.config();

// // Authentication Middleware
// const auth = (requiredRoles = []) => {
//   return (req, res, next) => {
//     try {
//       const token = req.headers.authorization;

//       if (!token) {
//         return res.status(401).json({ message: "No token provided." });
//       }

//       jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
//         if (err) {
//           return res.status(403).json({ message: "Invalid token." });
//         } 

//         req.user = decoded; // Attach decoded user data to the request

//         // If no specific roles are required, allow access
//         if (requiredRoles.length === 0) {
//           return next();
//         }

//         // Check if the user's role matches any of the required roles
//         const userRoles = decoded.roles || [];
//         const hasRequiredRole = Array.isArray(userRoles)
//           ? userRoles.some((role) => requiredRoles.includes(role))
//           : requiredRoles.includes(userRoles);

//         if (!hasRequiredRole) {
//           return res.status(403).json({
//             message: "Access denied: You do not have the required permissions.",
//           });
//         }

//         next();
//       });
//     } catch (error) {
//       console.error("Authentication error:", error.message);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   };
// };

// // Permission Checking Middleware
// const checkPermission = (requiredPermission) => {
//   return (req, res, next) => {
//     try {
//       const { permissions } = req.user; // Assume permissions are included in the token payload

//       if (
//         Array.isArray(permissions) &&
//         (permissions.includes("all_management") || permissions.includes(requiredPermission))
//       ) {
//         return next();
//       }

//       return res.status(403).json({
//         message: "Access denied: Insufficient permissions.",
//       });
//     } catch (error) {
//       console.error("Permission checking error:", error.message);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   };
// };

// module.exports = { auth, checkPermission };

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

 

const auth = (requiredRoles = []) => {
  return (req, res, next) => {
    try {
      // Extract token from Authorization header
      const token = req.headers.authorization 

      if (!token) {
        return res.status(401).json({ message: "No token provided." });
      }

      jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
          }
          return res.status(403).json({ message: "Invalid token." });
        }

        // console.log("🔍 Full Decoded Token:", JSON.stringify(decoded, null, 2));

        let userRoles = [];
        let userPermissions = [];

         if (typeof decoded.roles === "string") {
          userRoles = [decoded.roles];
        } else if (Array.isArray(decoded.roles)) {
          userRoles = decoded.roles;  
        } else if (decoded.roles && typeof decoded.roles === "object") {
          userRoles = decoded.roles.roles ? [decoded.roles.roles] : [];
        }

        userPermissions = decoded.permissions || [];

        req.user = {
          id: decoded._id || decoded.id,
          email: decoded.email,
          first_name: decoded.first_name || "",
          last_name: decoded.last_name || "",
          roles: userRoles, // ✅ Now properly extracted
          permissions: userPermissions,
        };

        // console.log("✅ Extracted User Data:", req.user);

        // Allow access if no specific roles are required
        if (requiredRoles.length === 0) {
          return next();
        }

        // ✅ Check if user has required role
        const hasRequiredRole = userRoles.some((role) => requiredRoles.includes(role));

        if (!hasRequiredRole) {
          return res.status(403).json({
            message: "Access denied: You do not have the required permissions.",
          });
        }

        next();
      });
    } catch (error) {
      console.error("Authentication error:", error.message);
      res.status(500).json({ message: "Internal server error." });
    }
  };
};


module.exports = { auth  };
