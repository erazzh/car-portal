function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (!error) return next();

    return res.status(400).json({
      error: "Validation error",
      details: error.details.map(d => d.message)
    });
  };
}

module.exports = validate;
