/**
 * Auth utility functions for JWT handling
 */

// This is a fixed secret used for JWT signing and verification
// In a production environment, consider a more secure approach like:
// - Using an environment variable on your hosting platform
// - Generating a secret based on your database configuration
// - Using a key management service
const JWT_SECRET = "mycrm_secret_key_2024_secure_application_dont_share";

/**
 * Get the JWT secret used for token signing and verification
 * @returns TextEncoder encoded secret
 */
export function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

/**
 * Generate unique user identifier for token generation
 * @param userId The user's ID from the database
 * @returns A string that can be used to identify this user session
 */
export function generateTokenId(userId: string): string {
  return `${userId}_${new Date().getTime()}`;
}