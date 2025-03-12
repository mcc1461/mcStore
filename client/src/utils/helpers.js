// src/utils/helpers.js

/**
 * Capitalizes the first letter of the input string and lowercases the rest.
 * @param {string} str - The string to be capitalized.
 * @returns {string} - The capitalized string.
 */
export function capitalize(str) {
  if (typeof str !== "string" || str.length === 0) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a number as currency.
 * @param {number} amount - The amount to be formatted.
 * @returns {string} - The formatted currency string.
 */
export function formatCurrency(amount) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a date as a string.
 * @param {Date} date - The date to be formatted.
 * @returns {string} - The formatted date string.
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US");
}

/**
 * Formats a number as a percentage.
 * @param {number} amount - The amount to be formatted.
 * @returns {string} - The formatted percentage string.
 */
export function formatPercentage(amount) {
  return `${amount.toFixed(2)}%`;
}

/**
 * Formats a number as a phone number.
 * @param {number} phone - The phone number to be formatted.
 * @returns {string} - The formatted phone number string.
 */
export function formatPhone(phone) {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
}

/**
 * Formats a number as a social security number.
 * @param {number} ssn - The social security number to be formatted.
 * @returns {string} - The formatted social security number string.
 */
export function formatSSN(ssn) {
  return ssn.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3");
}

/**
 * Formats a string as a title.
 * @param {string} str - The string to be formatted.
 * @returns {string} - The formatted title string.
 */
export function formatTitle(str) {
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Formats a string as a URL slug.
 * @param {string} str - The string to be formatted.
 * @returns {string} - The formatted URL slug string.
 */
export function formatSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Formats a string as a username.
 * @param {string} str - The string to be formatted.
 * @returns {string} - The formatted username string.
 */
export function formatUsername(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
}

/**
 * Formats a string as a password.
 * @param {string} str - The string to be formatted.
 * @returns {string} - The formatted password string.
 */
export function formatPassword(str) {
  return str.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
}

/**
 * Formats a string as an email.
 * @param {string} str - The string to be formatted.
 * @returns {string} - The formatted email string.
 */
export function formatEmail(str) {
  return str.replace(/[^a-zA-Z0-9@.]/g, "").slice(0, 50);
}

/**
 * Formats a string as an address.
 * @param {string} str - The string to be formatted.
 * @returns {string} - The formatted address string.
 */
export function formatAddress(str) {
  return str.replace(/[^a-zA-Z0-9\s]/g, "").slice(0, 50);
} // utils/helpers.js
