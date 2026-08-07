import { format, parseISO } from 'date-fns';

const toDate = (value) => (typeof value === 'string' ? parseISO(value) : new Date(value));

export const formatDate = (value, pattern = 'dd MMM yyyy') => {
  if (!value) return '-';
  return format(toDate(value), pattern);
};

export const formatTime = (value) => {
  if (!value) return '-';
  return format(toDate(value), 'hh:mm a');
};

export const formatHours = (hours) => {
  if (hours === undefined || hours === null) return '-';
  return `${Number(hours).toFixed(2)}h`;
};

export const formatLocation = (location) => {
  if (!location) return '-';
  if (location.address) return location.address;
  if (location.latitude != null && location.longitude != null) {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
  return '-';
};
