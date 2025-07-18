// middleware/packageMiddleware.js
const checkPackageAccess = (requiredService) => async (req, res, next) => {
  try {
    const { package_Type } = req.company;

    if (!package_Type.package_Name.includes(requiredService)) {
      return res
        .status(403)
        .json({ message: "Access denied: Upgrade your package" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = checkPackageAccess;
