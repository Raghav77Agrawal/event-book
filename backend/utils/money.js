const PRICE_SCALE = 100;

const decimalStringToPaise = (value) => {
  if (value === null || value === undefined) return null;

  const normalized = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const [wholePart, fractional = ""] = normalized.split(".");
  const whole = Number(wholePart);
  const fraction = Number(fractional.padEnd(2, "0"));

  if (!Number.isInteger(whole) || !Number.isInteger(fraction)) return null;
  return (whole * PRICE_SCALE) + fraction;
};

const paiseToDecimalString = (value) => {
  if (!Number.isInteger(value) || value < 0) return null;
  return (value / PRICE_SCALE).toFixed(2);
};

module.exports = {
  PRICE_SCALE,
  decimalStringToPaise,
  paiseToDecimalString,
};
