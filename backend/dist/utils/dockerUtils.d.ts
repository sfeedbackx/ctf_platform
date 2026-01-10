import type { containerConfig, containerInstance } from '../types/dockerTypes.js';
import { type AppError } from '../types/errorTypes.js';
/**
 * Generates a random port number in the range [3001, 4000) that is not in use or reserved.
 *
 * Attempts up to 100 times to find an available port. If none is found, returns undefined.
 *
 * @param {number[]} usedPorts - List of ports already in use on the host.
 * @param {Set<number>} [reservedPorts=new Set()] - Additional set of ports to avoid (e.g., system-reserved).
 * @returns {number | undefined} A valid available port, or undefined if none could be found after 100 attempts.
 */
export declare const generateValidPorts: (usedPorts: number[], reservedPorts?: Set<number>) => number | undefined;
/**
 * Stops one or more Docker containers gracefully.
 *
 * Handles cases where a container may already be stopped or removed (e.g., 404 errors),
 * and logs internal Docker daemon errors (5xx) separately.
 *
 * @param {string[] | string} containersId - Container ID(s) or name(s) to stop.
 * @returns {Promise<void>} Resolves when all stop attempts are complete.
 */
export declare const stopContainers: (containersId: string[] | string) => Promise<void>;
/**
 * Starts a CTF challenge instance composed of a backend and a frontend container,
 * without involving a database. The backend is isolated (not exposed), while the
 * frontend is exposed on a given valid port and configured to communicate with
 * the backend container via Docker networking.
 *
 * Both containers are labeled with metadata including expiration time, CTF ID,
 * and user ID for management and cleanup purposes.
 *
 * If any step fails (missing config, container creation error, or health check failure),
 * already-started containers are stopped and an appropriate error is returned.
 *
 * @param {containerConfig[]} containers - Array expected to contain exactly two elements:
 *                                         [0] = backend container config, [1] = frontend container config.
 * @param {string} userId - Unique identifier of the user launching the instance.
 * @param {number} validPort - The host port on which the frontend container will be exposed.
 * @param {string} ctfId - Identifier of the CTF challenge being instantiated.
 * @param {string} ctfInstanceId - Unique ID for this specific runtime instance of the challenge.
 * @param {number} [expiredAt] - Unix timestamp (in milliseconds) indicating when the instance should expire.
 *                               Defaults to 1 hour from the current time.
 *
 * @returns {Promise<containerInstance[] | AppError>}
 *   - On success: array of two `containerInstance` objects: [frontend, backend].
 *   - On failure: an `AppError` object describing what went wrong.
 */
export declare const startInstanceWithoutDb: (containers: containerConfig[], userId: string, validPort: number, ctfId: string, ctfInstanceId: string, expiredAt?: number) => Promise<containerInstance[] | AppError>;
//# sourceMappingURL=dockerUtils.d.ts.map