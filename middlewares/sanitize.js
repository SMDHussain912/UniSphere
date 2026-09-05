const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      value[index] = sanitizeValue(item);
    });
    return value;
  }

  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      // Prevent NoSQL injection: strip keys starting with $ or containing .
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
      } else {
        value[key] = sanitizeValue(value[key]);
      }
    });
    return value;
  }

  // NOTE: We intentionally do NOT HTML-escape string values here.
  // This is a JSON API — XSS prevention happens at render time in the frontend.
  // HTML-escaping here would corrupt legitimate code input (e.g. if (a < b)).
  return value;
};

const sanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') sanitizeValue(req.body);
  if (req.query && typeof req.query === 'object') sanitizeValue(req.query);
  if (req.params && typeof req.params === 'object') sanitizeValue(req.params);
  next();
};

module.exports = sanitize;
