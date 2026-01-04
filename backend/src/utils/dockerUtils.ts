import Dockerode from 'dockerode';
import * as fs from 'node:fs';
import type {
  containerConfig,
  containerInstance,
} from '../types/dockerTypes.js';

import { HTTP_CODE } from '../types/httpCodes.js';
import { ERROR_NAME, type AppError } from '../types/errorTypes.js';
import { serviceType } from '../types/enums.js';
import configEnv from '../config/config.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// for ec2 connection
const docker = new Dockerode({
  host: 'EC2:IP_Address', //fron env it should not be hardcoded
  protocol: 'https',
  port: 2376,
  ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
});
/**
 * Generates a random port number in the range [3001, 4000) that is not in use or reserved.
 *
 * Attempts up to 100 times to find an available port. If none is found, returns undefined.
 *
 * @param {number[]} usedPorts - List of ports already in use on the host.
 * @param {Set<number>} [reservedPorts=new Set()] - Additional set of ports to avoid (e.g., system-reserved).
 * @returns {number | undefined} A valid available port, or undefined if none could be found after 100 attempts.
 */
export const generateValidPorts = (
  usedPorts: number[],
  reservedPorts: Set<number> = new Set(),
): number | undefined => {
  for (let i = 0; i < 100; i++) {
    const genPort = Math.floor(Math.random() * (4000 - 3001) + 3001);
    if (!usedPorts.includes(genPort) && !reservedPorts.has(genPort)) {
      return genPort;
    }
  }
  return undefined; // Explicitly indicates failure to find a port
};

/**
 * Stops one or more Docker containers gracefully.
 *
 * Handles cases where a container may already be stopped or removed (e.g., 404 errors),
 * and logs internal Docker daemon errors (5xx) separately.
 *
 * @param {string[] | string} containersId - Container ID(s) or name(s) to stop.
 * @returns {Promise<void>} Resolves when all stop attempts are complete.
 */
export const stopContainers = async (
  containersId: string[] | string,
): Promise<void> => {
  const ids = Array.isArray(containersId) ? containersId : [containersId];
  if (ids.length === 0) {
    return;
  }

  await Promise.all(
    ids.map(async (id) => {
      try {
        const container = docker.getContainer(id);
        await container.stop({ t: 10 });
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'statusCode' in err &&
          typeof err.statusCode === 'number' &&
          err.statusCode >= 500
        ) {
          const error = err as { statusCode: number; message?: string };
          console.error(
            `[ERROR] Docker daemon error (${error.statusCode}) for ${id.slice(0, 12)}:`,
            error.message || 'Unknown error',
          );
        }
      }
    }),
  );
};

/**
 * Creates and starts a Docker container based on the provided configuration.
 *
 * The container is configured with resource limits, optional port exposure (bound to 127.0.0.1),
 * environment variables, and labels. Auto-remove is enabled.
 *
 * If successful, returns a containerInstance with metadata (ID, name, URL, expiration, etc.).
 * On failure, returns an AppError-like object.
 *
 * @param {containerConfig} config - Configuration for the container to create.
 * @returns {Promise<containerInstance | AppError>} Created container info or error object.
 */
const createChallengeContainer = async (
  config: containerConfig,
): Promise<containerInstance | AppError> => {
  try {
    const container = await docker.createContainer({
      Image: config.image,
      name: config.name,
      HostConfig: {
        AutoRemove: true, // Remove container automatically after it exits
        Memory: 512 * 1024 * 1024, // 512 MB memory limit
        MemorySwap: 512 * 1024 * 1024, // No swap beyond memory limit
        NanoCpus: 256000000, // 0.256 CPU core
        NetworkMode: config.networkMode,
        // Expose port only if config.exposed is true (for development)
        // In production, do not expose ports directly - use reverse proxy
        ...(config.exposed &&
          config.exposedPort && {
            PortBindings: {
              [`${config.internalPort}/tcp`]: [
                {
                  HostIP: '127.0.0.1', //this should 0.0.0.0 or we need to figure out how we can use nginx dynamicly for port forwarding
                  HostPort: config.exposedPort.toString(),
                },
              ],
            },
          }),
      },
      ExposedPorts: {
        [`${config.internalPort}/tcp`]: {},
      },
      Env: config.env
        ? Object.entries(config.env).map(([k, v]) => `${k}=${v}`)
        : [],
      Labels: config.labels ? config.labels : {},
    });

    await container.start();

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    let url: string | undefined;

    if (config.exposed && config.exposedPort) {
      const protocol = configEnv.nodeEnv === 'production' ? 'https' : 'http';
      const hostname = configEnv.serverHost;
      url = `${protocol}://${hostname}:${config.exposedPort}`;
    }

    return {
      name: config.name,
      id: container.id,
      expiresAt,
      url,
      port: config.exposedPort,
      internalPort: config.internalPort,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[ERROR] Container not initialized:', error.message);
      return {
        ...error,
        message: 'containerError',
        statusNumber: 500,
      };
    }
    console.error('[ERROR] Container not initialized:', error);
    return {
      name: 'INTERNAL_ERROR',
      message: 'containerError',
      statusNumber: 500,
    };
  }
};

/**
 * Cleans up stale Docker containers based on two criteria:
 * 1. Containers with an 'expiresAt' label that has passed.
 * 2. Fallback: containers running longer than 2 hours (based on creation time).
 * 3. Additional fallback: containers with uptime >= 2 hours or in days/weeks/etc. (via regex on Status string).
 *
 * Note: The regex-based uptime check may be fragile; Docker's Status field format can vary.
 *
 * All matched containers are stopped (and will auto-remove if configured).
 *
 * @returns {Promise<void>} Resolves when cleanup is complete.
 */
/*export const containerCleanUp = async (): Promise<void> => {
  const containers = await docker.listContainers();

  // Regex to detect containers with uptime >= 2 hours (e.g., "Up 2 hours", "Up 3 days", etc.)
  // Note: This pattern may not cover all edge cases (e.g., "Up About an hour").
  const dockerUptimeRegex =
    /^Up\s+(?:[2-9]|[1-9]\d+)\s+hours$|^Up\s+\d+\s+(?:days?|weeks?|months?|years?)$/;

  const containersToClean = containers.filter((c) => {
    const labels = c.Labels ?? {};

    // 1️⃣ Expiration-based cleanup (preferred method)
    if ('expiresAt' in labels) {
      const expiresAt = Number(labels.expiresAt);
      if (!Number.isNaN(expiresAt)) {
        return expiresAt < Date.now();
      }
    }

    // 2️⃣ Time-since-creation fallback (2 hours)
    if (c.Created) {
      const diff = Date.now() - c.Created;
      return diff > 2 * 60 * 60 * 1000;
    }

    // 3️⃣ Uptime string fallback (less reliable)
    return dockerUptimeRegex.test(c.Status);
  });

  const ids = containersToClean.map((c) => c.Id);
  await stopContainers(ids);
};
*/
/**
 * Waits for a container to reach a 'running' state by polling its status.
 *
 * Retries up to `maxAttempts` times with a delay between checks.
 * Only checks if status is "running"; does not verify application-level health.
 *
 * @param {string} containerIdOrName - Container ID or name to monitor.
 * @param {{ maxAttempts?: number; delayMs?: number }} [options] - Polling configuration.
 * @param {number} [options.maxAttempts=30] - Maximum number of inspection attempts.
 * @param {number} [options.delayMs=1000] - Delay in milliseconds between attempts.
 * @returns {Promise<boolean>} True if container became running within the attempt limit, false otherwise.
 */
const waitForContainerHealth = async (
  containerIdOrName: string,
  options: {
    maxAttempts?: number;
    delayMs?: number;
  } = {},
): Promise<boolean> => {
  const { maxAttempts = 30, delayMs = 1000 } = options;
  const container = docker.getContainer(containerIdOrName);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const inspect = await container.inspect();

      if (inspect.State.Status !== 'running') {
        await sleep(delayMs);
        continue;
      }

      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      if (attempt === maxAttempts) {
        return false;
      }
      await sleep(delayMs);
    }
  }

  return false;
};

/**
 * Utility function to pause execution for a given number of milliseconds.
 *
 * @param {number} ms - Delay time in milliseconds.
 * @returns {Promise<void>} Resolves after the specified delay.
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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
export const startInstanceWithoutDb = async (
  containers: containerConfig[],
  userId: string,
  validPort: number,
  ctfId: string,
  ctfInstanceId: string,
  expiredAt: number = Date.now() + 60 * 60 * 1000,
): Promise<containerInstance[] | AppError> => {
  // Define shared Docker labels for both containers (used for tracking and auto-cleanup)
  const newLabel = {
    expiresAt: `${expiredAt}`,
    ctf_challenge: ctfId,
    ctf_user: userId,
  };

  // --- Backend Container Setup ---
  // Assume the first container in the array is the backend (index 0)
  const backendContainerConfig = containers[0];

  // Validate that backend config exists and is of type BACKEND
  if (
    !backendContainerConfig ||
    backendContainerConfig.type !== serviceType.BACKEND
  ) {
    return {
      name: ERROR_NAME.DATABASE_ERROR.toString(),
      message: 'backend container config not found',
      statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
    };
  }

  // Ensure backend is not exposed to the host (internal-only service)
  backendContainerConfig.exposed = false;
  // Append instance ID to container name for uniqueness
  backendContainerConfig.name = `${backendContainerConfig.name}_${ctfInstanceId}`;
  // Attach metadata labels
  backendContainerConfig.labels = newLabel;

  // Ensure backend has PORT environment variable set to its internalPort
  const backendEnvObj =
    backendContainerConfig.env instanceof Map
      ? Object.fromEntries(backendContainerConfig.env)
      : backendContainerConfig.env || {};
  backendEnvObj.PORT = backendContainerConfig.internalPort.toString();
  backendContainerConfig.env = backendEnvObj;

  // Attempt to create the backend container
  const startedContainer: containerInstance | AppError =
    await createChallengeContainer(backendContainerConfig);

  // Handle creation failure: stop any partial resources and return error
  if ('message' in startedContainer && !('id' in startedContainer)) {
    await stopContainers([backendContainerConfig.name]);
    return {
      name: ERROR_NAME.DOCKER_ERROR.toString(),
      message: 'backend not initialized',
      statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
    };
  }

  // Wait for the backend container to become healthy
  const isBackendContainerWorking = await waitForContainerHealth(
    (startedContainer as containerInstance).id,
  );
  if (!isBackendContainerWorking) {
    // Health check failed – clean up backend container
    await stopContainers([backendContainerConfig.name]);
    return {
      name: ERROR_NAME.DOCKER_ERROR,
      message: 'backend health check not passed',
      statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
    };
  }

  // --- Frontend Container Setup ---
  // Assume the second container in the array is the frontend (index 1)
  const frontendContainerConfig = containers[1];

  // Validate that frontend config exists and is of type FRONTEND
  if (
    !frontendContainerConfig ||
    frontendContainerConfig.type !== serviceType.FRONTEND
  ) {
    // Backend was already created – must clean it up before returning error
    await stopContainers([backendContainerConfig.name]);
    return {
      name: ERROR_NAME.DATABASE_ERROR.toString(),
      message: 'frontend container config not found',
      statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
    };
  }

  // Ensure frontend container name is unique per instance
  frontendContainerConfig.name = `${frontendContainerConfig.name}_${ctfInstanceId}`;

  // Configure frontend to point to the backend container by its Docker network name
  // Convert Map to plain object if needed (MongoDB Map type from .lean() query)
  const envObj =
    frontendContainerConfig.env instanceof Map
      ? Object.fromEntries(frontendContainerConfig.env)
      : frontendContainerConfig.env || {};

  // Update BACKEND_HOST to use the actual backend container name (with instance ID)
  envObj.BACKEND_HOST = backendContainerConfig.name;

  // Ensure BACKEND_PORT is set to backend's internal port
  envObj.BACKEND_PORT = backendContainerConfig.internalPort.toString();

  frontendContainerConfig.env = envObj;

  // Expose frontend on the provided host port
  frontendContainerConfig.exposedPort = validPort;
  // Attach the same metadata labels as the backend
  frontendContainerConfig.labels = newLabel;

  // Attempt to create the frontend container
  const startedContainerFrontend: containerInstance | AppError =
    await createChallengeContainer(frontendContainerConfig);

  // Handle frontend creation failure: stop both containers if needed
  if (
    'message' in startedContainerFrontend &&
    !('id' in startedContainerFrontend)
  ) {
    await stopContainers([
      backendContainerConfig.name,
      frontendContainerConfig.name,
    ]);
    return {
      name: ERROR_NAME.DOCKER_ERROR.toString(),
      message: 'frontend not initialized',
      statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
    };
  }

  // Wait for the frontend container to become healthy
  const isFrontendWorking = await waitForContainerHealth(
    (startedContainerFrontend as containerInstance).id,
  );
  if (!isFrontendWorking) {
    // Health check failed – clean up both containers
    await stopContainers([
      backendContainerConfig.name,
      frontendContainerConfig.name,
    ]);
    return {
      name: ERROR_NAME.DOCKER_ERROR,
      message: 'frontend health check not passed',
      statusNumber: HTTP_CODE.INTERNAL_SERVER_ERROR,
    };
  }

  // Return both container instances: [frontend, backend]
  return [
    startedContainerFrontend as containerInstance,
    startedContainer as containerInstance,
  ];
};
