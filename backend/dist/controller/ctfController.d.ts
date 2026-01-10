import type { NextFunction, Request, Response } from 'express';
/**
 * Fetches all CTF challenges from the database and returns a sanitized list for public display.
 * Omits sensitive fields like container configurations.
 *
 * @param {Request} _req - Express request (unused).
 * @param {Response} res - Express response object.
 * @returns  JSON response with list of CTFs or empty array.
 */
export declare const getCtfs: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const submitFlag: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const getActiveInstance: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Handles the creation (or resumption) of a CTF challenge instance for an authenticated user.
 *
 * Business rules:
 * - Cannot start an instance for a CTF the user has already solved.
 * - A user can only have one active instance (RUNNING or PENDING) at a time across all CTFs.
 * - If a PENDING instance exists for the same CTF, the system resumes setup instead of creating a new one.
 * - On success: launches containers, reserves a port, and updates DB to RUNNING.
 * - On failure: cleans up (deletes DB record, releases port, stops any launched containers).
 *
 * @param {Request} req - Express request (must include userId and solvedCtf via custom type).
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Express error-passing middleware.
 * @returns  Sends instance data or passes error to error-handling middleware.
 */
export declare const createCtfInstance: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Stops a running CTF challenge instance for a specific user.
 *
 * - Validates that the instance belongs to the authenticated user.
 * - Silently succeeds (idempotent) if the instance is already TERMINATED or STOPPED.
 * - Stops all associated Docker containers.
 * - Updates the instance status to TERMINATED in the database.
 * - Returns a  success response .
 *
 * @param {Request} req - Express request object. Must contain `userId` (via `reqWithId`) and `id` in params.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express error-handling middleware pass-through.
 * @returns  Sends JSON success response or passes error to middleware.
 */
export declare const stopCtfInstance: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Performs automated cleanup of expired CTF challenge instances.
 *
 * - Finds all CTF instances in RUNNING or PENDING state whose `expiresAt` timestamp is in the past.
 * - Stops their associated Docker containers.
 * - Updates their database status to TERMINATED (or FAILED if cleanup errors occur).
 * - Uses `Promise.allSettled` to ensure all instances are processed independently (no cascade failure).
 * - Logs detailed progress and final summary.
 *
 * This function is typically scheduled via a cron job or background task.
 *
 * @returns {Promise<void>} Resolves when cleanup attempt is complete (success or failure per instance).
 */
export declare const containersCleanUp: () => Promise<void>;
//# sourceMappingURL=ctfController.d.ts.map