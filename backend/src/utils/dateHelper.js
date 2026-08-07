export const normalizeDate = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const parseDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return normalizeDate(d);
};

export const endOfDayUTC = (value) => {
  const d = parseDateOnly(value);
  if (!d) return null;
  d.setUTCHours(23, 59, 59, 999);
  return d;
};
