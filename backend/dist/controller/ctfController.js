import Ctf from '../models/ctfModel.js';
import { HTTP_CODE } from '../types/httpCodes.js';
import CtfInstance from '../models/ctfInstanceModel.js';
import { ERROR_NAME } from '../types/errorTypes.js';
import { generateValidPorts, startInstanceWithoutDb, stopContainers, } from '../utils/dockerUtils.js';
import mongoose from 'mongoose';
import { instanceState } from '../types/enums.js';
import User from '../models/userModel.js';
import { generateToken } from '../utils/jwtUtils.js';
import configEnv from '../config/config.js';
/**
 * Converts raw Docker container instances into a structured ICtfInstance for database storage.
 *
 * Extracts the public URL from the first container that provides one (assumed to be the frontend).
 *
 * @param {containerInstance[]} workingContainers - List of successfully started containers.
 * @param {string} userId - User ID as string.
 * @param {string} ctfId - CTF ID as string.
 * @param {Date} expiresAt - Expiration timestamp.
 * @returns {ICtfInstance | AppError} Ready-to-store instance object or error if URL is missing.
 */
const ctfInstancePreparation = (workingContainers, userId, ctfId, expiresAt) => {
    const extractedUrl = workingContainers.find((c) => c.url)?.url;
    if (!extractedUrl) {
        return {
            name: ERROR_NAME.VALIDATION_ERROR,
            message: 'Url not found',
            statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
        };
    }
    return {
        userId: new mongoose.Types.ObjectId(userId),
        ctfId: new mongoose.Types.ObjectId(ctfId),
        expiresAt: expiresAt,
        status: instanceState.RUNNING,
        url: extractedUrl,
        containers: workingContainers.map((c) => {
            return {
                name: c.name,
                port: c.port,
            };
        }),
    };
};
/**
 * Type guard to check if a given object is an AppError (based on presence of 'message' and absence of 'containers').
 *
 * @param {ICtfInstance | AppError} obj - The object to inspect.
 * @returns {obj is AppError} True if the object matches the AppError structure.
 */
function isAppError(obj) {
    return 'message' in obj && !('containers' in obj);
}
/**
 * Fetches all CTF challenges from the database and returns a sanitized list for public display.
 * Omits sensitive fields like container configurations.
 *
 * @param {Request} _req - Express request (unused).
 * @param {Response} res - Express response object.
 * @returns  JSON response with list of CTFs or empty array.
 */
export const getCtfs = async (_req, res) => {
    const ctfs = await Ctf.find();
    if (!ctfs || ctfs.length === 0) {
        return res.status(HTTP_CODE.SUCCESS).json([]);
    }
    const ctfsRes = ctfs.map((c) => {
        return {
            id: c._id,
            name: c.name,
            type: c.type,
            description: c.description,
            difficulty: c.difficulty,
            hints: c.hints,
            resources: c.resources,
            withSite: c.withSite,
        };
    });
    return res.status(HTTP_CODE.SUCCESS).json(ctfsRes);
};
export const submitFlag = async (req, res, next) => {
    const { flag } = req.body;
    if (!flag) {
        return next({
            name: ERROR_NAME.VALIDATION_ERROR.toString(),
            message: 'flag required',
            statusNumber: HTTP_CODE.BAD_REQUEST,
        });
    }
    const userId = req.userId;
    const solvedCtfs = req.solvedCtf;
    // Block attempt if user already solved this CTF
    if (solvedCtfs.some((c) => c._id.toString() === req.params.id)) {
        return res.status(HTTP_CODE.SUCCESS).json({
            success: true,
            message: 'Congratulations! You already solved this CTF',
        });
    }
    // Validate CTF exists and fetch flag
    const ctfFlag = await Ctf.findOne({
        _id: req.params.id,
    })
        .select({ flag: 1 })
        .lean();
    if (!ctfFlag) {
        return next({
            name: ERROR_NAME.NOT_FOUND_ERROR.toString(),
            message: 'Ctf not found',
            statusNumber: HTTP_CODE.NOT_FOUND,
        });
    }
    if (ctfFlag.flag !== flag) {
        return next({
            name: ERROR_NAME.VALIDATION_ERROR.toString(),
            message: 'Wrong flag',
            statusNumber: HTTP_CODE.BAD_REQUEST,
        });
    }
    const newUpdateUser = await User.findOneAndUpdate({ _id: userId }, {
        $addToSet: {
            solvedCtf: ctfFlag._id,
        },
    }, { new: true });
    if (!newUpdateUser) {
        return next({
            name: ERROR_NAME.DATABASE_ERROR,
            message: 'Doc not updated',
            statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
        });
    }
    // Update count based on actual array length
    await User.findByIdAndUpdate(userId, {
        $set: {
            numberOfSolvedCtf: newUpdateUser.solvedCtf.length,
        },
    });
    //update token
    const userToken = generateToken({
        id: userId,
        numberOfSolvedCtf: newUpdateUser.solvedCtf.length,
        email: newUpdateUser.email,
    });
    res.cookie('token', userToken, {
        httpOnly: true,
        secure: configEnv.nodeEnv === 'production',
        sameSite: 'strict', // CSRF protection
        maxAge: configEnv.maxAge, // 7 days in milliseconds
    });
    return res.status(HTTP_CODE.SUCCESS).json({
        success: true,
        message: 'Congratulations! You  solved this CTF',
    });
};
// Get current user's active instance (if any)
export const getActiveInstance = async (req, res, next) => {
    try {
        const userId = req.userId;
        const activeInstance = await CtfInstance.findOne({
            userId,
            status: { $in: [instanceState.PENDING, instanceState.RUNNING] },
        }).select('-__v');
        if (!activeInstance) {
            return res.status(HTTP_CODE.SUCCESS).json({
                success: true,
                instance: null,
            });
        }
        return res.status(HTTP_CODE.SUCCESS).json({
            success: true,
            instance: {
                id: activeInstance._id,
                ctfId: activeInstance.ctfId,
                status: activeInstance.status,
                url: activeInstance.url,
                expiresAt: activeInstance.expiresAt,
            },
        });
    }
    catch (error) {
        return next({
            name: ERROR_NAME.INTERNAL_ERROR,
            message: error instanceof Error ? error.message : 'Failed to fetch instance',
            statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
        });
    }
};
// Tracks ports currently reserved during instance creation to prevent collision in concurrent requests
const portReservations = new Set();
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
export const createCtfInstance = async (req, res, next) => {
    const userId = req.userId;
    const solvedCtfs = req.solvedCtf;
    // Block attempt if user already solved this CTF
    if (solvedCtfs.some((c) => c._id.toString() === req.params.id)) {
        return next({
            name: ERROR_NAME.CONFLICT_ERROR.toString(),
            message: 'ctf already solved',
            statusNumber: HTTP_CODE.CONFLICT,
        });
    }
    // List of container names to stop if setup fails midway
    let containersToStopInFailure = [];
    // Validate CTF exists and fetch its container configuration
    const ctfContainersConfig = await Ctf.findOne({
        _id: req.params.id,
    })
        .select({ containersConfig: 1, withSite: 1 })
        .lean();
    if (!ctfContainersConfig) {
        return next({
            name: ERROR_NAME.NOT_FOUND_ERROR.toString(),
            message: 'Ctf not found',
            statusNumber: HTTP_CODE.NOT_FOUND,
        });
    }
    // check if ctf is really a with site
    if (!ctfContainersConfig.withSite) {
        return next({
            name: ERROR_NAME.VALIDATION_ERROR.toString(),
            message: 'Ctf with no site',
            statusNumber: HTTP_CODE.BAD_REQUEST,
        });
    }
    // Check for any active instance (RUNNING or PENDING) for this user
    let instanceToSetup = undefined;
    let resInstances;
    const ctfInstance = await CtfInstance.findOne({
        userId,
        status: { $in: [instanceState.PENDING, instanceState.RUNNING] },
    });
    if (ctfInstance) {
        // Same CTF → reuse
        if (ctfInstance.ctfId.equals(ctfContainersConfig._id)) {
            // Already RUNNING → return immediately
            if (ctfInstance.status === instanceState.RUNNING.toString()) {
                return res.status(HTTP_CODE.SUCCESS).json({
                    id: ctfInstance._id,
                    userId: ctfInstance.userId,
                    ctfId: ctfInstance.ctfId,
                    expiresAt: ctfInstance.expiresAt,
                    status: ctfInstance.status,
                    url: ctfInstance.url,
                });
            }
            // PENDING → resume setup
            instanceToSetup = ctfInstance;
        }
        else {
            // Different CTF is active → reject new request
            return next({
                name: ERROR_NAME.CONFLICT_ERROR,
                message: 'You already have an active instance of another challenge. Please stop it before starting a new one.',
                statusNumber: HTTP_CODE.CONFLICT,
            });
        }
    }
    // Create new PENDING instance if needed, and gather port usage info
    if (!instanceToSetup) {
        const [newInstance, resultInstances] = await Promise.all([
            CtfInstance.create({
                userId,
                ctfId: ctfContainersConfig._id,
                status: instanceState.PENDING,
            }),
            CtfInstance.find({
                status: { $in: [instanceState.RUNNING, instanceState.PENDING] },
            })
                .select('containers.port')
                .lean(),
        ]);
        instanceToSetup = newInstance;
        resInstances = resultInstances;
    }
    else {
        // Reusing PENDING: fetch ports from OTHER instances only
        resInstances = await CtfInstance.find({
            status: { $in: [instanceState.RUNNING, instanceState.PENDING] },
            _id: { $ne: instanceToSetup._id },
        })
            .select('containers.port')
            .lean();
    }
    if (!instanceToSetup) {
        return next({
            name: ERROR_NAME.DATABASE_ERROR,
            message: 'Failed to create CTF instance',
            statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
        });
    }
    // Build list of all currently used ports
    const ports = resInstances.flatMap((instance) => instance.containers.filter((c) => c.port !== undefined).map((c) => c.port));
    // Reserve a new valid port in range [3000, 4000)
    const validPort = generateValidPorts(ports, portReservations);
    if (!validPort) {
        await CtfInstance.findByIdAndDelete(instanceToSetup._id);
        return next({
            name: ERROR_NAME.RATE_LIMIT_ERROR,
            message: 'No available ports for CTF instance',
            statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
        });
    }
    portReservations.add(validPort);
    // Validate container configuration exists
    const containers = ctfContainersConfig.containersConfig || [];
    if (!containers || containers.length === 0) {
        portReservations.delete(validPort);
        await CtfInstance.findByIdAndDelete(instanceToSetup._id);
        return next({
            name: ERROR_NAME.DATABASE_ERROR.toString(),
            message: 'No containers config',
            statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
        });
    }
    // Only support 2-container setups (frontend + backend)
    if (containers.length === 2) {
        const timeOfexpiration = Date.now() + 60 * 60 * 1000;
        // Start containers via Docker
        const ctfInstanceWithoutDb = await startInstanceWithoutDb(containers, userId.toString(), validPort, ctfContainersConfig._id.toString(), instanceToSetup._id.toString(), timeOfexpiration);
        // Handle Docker launch error
        if ('status' in ctfInstanceWithoutDb && 'message' in ctfInstanceWithoutDb) {
            portReservations.delete(validPort);
            await CtfInstance.findByIdAndDelete(instanceToSetup._id);
            return next({
                name: ctfInstanceWithoutDb.name,
                message: ctfInstanceWithoutDb.message,
                statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
            });
        }
        // Transform container data into DB-ready format
        const ctfInstanceToCreate = ctfInstancePreparation(ctfInstanceWithoutDb, userId.toString(), ctfContainersConfig._id.toString(), new Date(timeOfexpiration));
        if (isAppError(ctfInstanceToCreate)) {
            portReservations.delete(validPort);
            await Promise.all([
                stopContainers(containersToStopInFailure),
                CtfInstance.findByIdAndDelete(instanceToSetup._id),
            ]);
            return next({
                name: ctfInstanceWithoutDb.name,
                message: ctfInstanceToCreate.message,
                statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
            });
        }
        // Record container names for potential cleanup
        containersToStopInFailure = ctfInstanceToCreate.containers.flatMap((c) => c.name);
        // Update PENDING → RUNNING in DB
        const updatedInstance = await CtfInstance.findOneAndUpdate({ _id: instanceToSetup._id }, {
            $set: {
                url: ctfInstanceToCreate.url,
                status: instanceState.RUNNING,
                expiresAt: timeOfexpiration,
                containers: ctfInstanceToCreate.containers,
            },
        }, { new: true });
        if (!updatedInstance) {
            portReservations.delete(validPort);
            await Promise.all([
                stopContainers(containersToStopInFailure),
                CtfInstance.findByIdAndDelete(instanceToSetup._id),
            ]);
            return next({
                name: ERROR_NAME.DATABASE_ERROR.toString(),
                message: 'Error while updating ctf',
                statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
            });
        }
        // Success: release port lock and return instance
        portReservations.delete(validPort);
        return res.status(HTTP_CODE.SUCCESS).json({
            id: updatedInstance._id,
            ctfId: updatedInstance.ctfId,
            userId: updatedInstance.userId,
            status: updatedInstance.status,
            url: updatedInstance.url,
            expiresAt: updatedInstance.expiresAt,
        });
    }
    else {
        // Unsupported number of containers (the support for 3 containers site (db+backend+frontend)
        // will be added in the future)
        return next({
            name: ERROR_NAME.DOCKER_ERROR.toString(),
            message: 'CTF configuration must contain exactly 2 containers (frontend + backend)',
            statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
        });
    }
};
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
export const stopCtfInstance = async (req, res, next) => {
    try {
        const userId = req.userId;
        const ctfInstanceId = req.params.id;
        const ctfInstance = await CtfInstance.findOne({
            userId,
            _id: new mongoose.Types.ObjectId(ctfInstanceId),
        });
        if (!ctfInstance) {
            return next({
                name: ERROR_NAME.NOT_FOUND_ERROR,
                message: 'CTF instance not found',
                statusNumber: HTTP_CODE.NOT_FOUND,
            });
        }
        // Check if already stopped/terminated
        if (ctfInstance.status === instanceState.TERMINATED ||
            ctfInstance.status === instanceState.STOPPED) {
            return res.status(HTTP_CODE.SUCCESS).json({
                success: true,
                message: 'CTF instance already stopped',
            });
        }
        // Stop containers
        const runningContainers = ctfInstance.containers.map((c) => c.name);
        await stopContainers(runningContainers);
        // Update instance status
        ctfInstance.status = instanceState.TERMINATED;
        await ctfInstance.save();
        // Send success response
        return res.status(HTTP_CODE.SUCCESS).json({
            success: true,
            message: 'CTF instance stopped successfully',
        });
    }
    catch (error) {
        return next({
            name: ERROR_NAME.INTERNAL_ERROR,
            message: error instanceof Error ? error.message : 'Failed to stop CTF instance',
            statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
        });
    }
};
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
export const containersCleanUp = async () => {
    try {
        console.log('[CRON] Starting CTF instances cleanup...');
        // Find all expired instances that are still running or pending
        const expiredInstances = await CtfInstance.find({
            expiresAt: { $lt: new Date() }, // Expired (less than now)
            status: {
                $in: [instanceState.RUNNING, instanceState.PENDING],
            },
        });
        if (expiredInstances.length === 0) {
            return;
        }
        console.log(`[CRON] Found ${expiredInstances.length} expired instances to clean up`);
        // Process each expired instance
        const cleanupResults = await Promise.allSettled(expiredInstances.map(async (instance) => {
            try {
                // Get container names to stop
                const containerNames = instance.containers.map((c) => c.name);
                // Stop containers first
                if (containerNames.length > 0) {
                    await stopContainers(containerNames);
                }
                // Update instance status to TERMINATED
                instance.status = instanceState.TERMINATED;
                await instance.save();
                return;
            }
            catch (error) {
                console.error(`[ERROR] [CRON] Failed to cleanup instance ${instance._id}:`, error);
                // Mark as FAILED if cleanup didn't work
                try {
                    instance.status = instanceState.FAILED;
                    await instance.save();
                }
                catch (saveError) {
                    console.error(`[ERROR] Failed to mark instance ${instance._id} as FAILED:`, saveError);
                }
                return;
            }
        }));
        // Log results
        const successful = cleanupResults.filter((r) => r.status === 'fulfilled').length;
        const failed = cleanupResults.filter((r) => r.status === 'rejected').length;
        console.log(`[CRON] Cleanup complete: ${successful} successful, ${failed} failed`);
    }
    catch (error) {
        console.error('[ERROR] Error during containers cleanup:', error);
        throw error;
    }
};
//# sourceMappingURL=ctfController.js.map