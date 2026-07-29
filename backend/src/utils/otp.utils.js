import crypto from 'crypto';

/**
 * Generates a random 6-digit OTP code as a string.
 * @returns {string} 6-digit OTP string
 */
export const generateOTP = () => {
  const otpNumber = crypto.randomInt(100000, 999999);
  return otpNumber.toString();
};

/**
 * Hashes an OTP using SHA-256 before storing in the database.
 * @param {string} otp - Plain text OTP string
 * @returns {string} Hex-encoded SHA-256 hash
 */
export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verifies an input OTP against a stored SHA-256 hash.
 * @param {string} inputOtp - Raw input OTP string from user
 * @param {string} storedHash - Stored SHA-256 hash from database
 * @returns {boolean} True if matching, false otherwise
 */
export const verifyOTPHash = (inputOtp, storedHash) => {
  const hashedInput = hashOTP(inputOtp);
  return hashedInput === storedHash;
};
