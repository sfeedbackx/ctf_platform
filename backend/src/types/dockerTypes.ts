import type { serviceType } from './enums.js';

// Base container interface with common fields
interface IBaseContainer {
  name: string;
  internalPort: number;
}
export interface ICftInstanceContainer {
  name: string;
  port?: number | undefined;
}

// Base container with port exposure fields
interface IContainerWithExposure extends IBaseContainer {
  port?: number | undefined; // Host port (undefined if not exposed)
  url?: string | undefined; // Public URL (undefined if not exposed)
}

// Container configuration
export interface containerConfig extends IBaseContainer {
  image: string;
  type: serviceType;
  exposedPort?: number;
  exposed: boolean;
  env?: Record<string, string>;
  labels?: Record<string, string>;
  networkMode: string;
}

// Container result (runtime information)
export interface containerResult extends IContainerWithExposure {
  id: string;
  expiresAt: Date;
  type: serviceType;
}

// Container instance (result without type)
export type containerInstance = Omit<containerResult, 'type'>;

// Legacy container interface (consider deprecating if not used)
export interface container {
  serviceName: string;
  containerId: string;
  exposedPort: number;
  url: string;
  internalPort: number;
  image: string;
  env: Record<string, string>;
}
