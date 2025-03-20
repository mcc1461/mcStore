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

export function formatNumber(num) {
  const absVal = Math.abs(num);

  // For values under 1000
  if (absVal < 1000) {
    const integerPart = Math.floor(absVal);
    const leftover = absVal - integerPart;
    // leftover === 0 means exactly an integer => no plus sign
    return leftover === 0 ? String(integerPart) : integerPart + "+";
  }

  // For values under 1,000,000
  if (absVal < 1_000_000) {
    const thousandsPart = Math.floor(absVal / 1000);
    const leftover = absVal % 1000;
    // leftover === 0 => exactly multiple of 1,000 => "5k"
    return thousandsPart + "k" + (leftover === 0 ? "" : "+");
  }

  // For values >= 1,000,000
  const millionsPart = Math.floor(absVal / 1_000_000);
  const leftover = absVal % 1_000_000;
  // leftover === 0 => exactly multiple of 1,000,000 => "12M"
  return millionsPart + "M" + (leftover === 0 ? "" : "+");
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

export function getChartData(labels, values) {
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(
          (label) => categoryColors[label] || "#000000"
        ),
        hoverBackgroundColor: labels.map(
          (label) => categoryColors[label] || "#000000"
        ),
      },
    ],
  };
}

export function getBarChartData(labels, values) {
  return {
    labels,
    datasets: [
      {
        label: "Value",
        data: values,
        backgroundColor: labels.map((label) => {
          // Adjust this as needed; you might import categoryColors from elsewhere
          return categoryColors[label] || "#000000";
        }),
        borderColor: labels.map((label) => categoryColors[label] || "#000000"),
        borderWidth: 1,
        maxBarThickness: 30,
      },
    ],
  };
}
