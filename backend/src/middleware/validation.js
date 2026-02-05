export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateMandatoryFields = (data, fields) => {
  const missing = [];
  fields.forEach((field) => {
    if (!data[field]) {
      missing.push(field);
    }
  });
  return missing;
};

export const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const allowedMimes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Only CSV and Excel files are allowed",
    });
  }

  const maxSize = process.env.MAX_FILE_SIZE || 52428800; // 50MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
    });
  }

  next();
};
