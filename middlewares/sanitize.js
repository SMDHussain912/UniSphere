const escapeValue = (value) => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      value[index] = escapeValue(item);
    });
    return value;
  }

  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
      } else {
        value[key] = escapeValue(value[key]);
      }
    });
    return value;
  }

  if (typeof value === 'string') {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return value;
};

const sanitize = (req, res, next) => {
  escapeValue(req.body);
  escapeValue(req.query);
  escapeValue(req.params);
  next();
};

module.exports = sanitize;
