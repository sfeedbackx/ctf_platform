import type { serviceType } from './enums.js';
interface IBaseContainer {
    name: string;
    internalPort: number;
}
export interface ICftInstanceContainer {
    name: string;
    port?: number | undefined;
}
interface IContainerWithExposure extends IBaseContainer {
    port?: number | undefined;
    url?: string | undefined;
}
export interface containerConfig extends IBaseContainer {
    image: string;
    type: serviceType;
    exposedPort?: number;
    exposed: boolean;
    env?: Record<string, string>;
    labels?: Record<string, string>;
    networkMode: string;
}
export interface containerResult extends IContainerWithExposure {
    id: string;
    expiresAt: Date;
    type: serviceType;
}
export type containerInstance = Omit<containerResult, 'type'>;
export interface container {
    serviceName: string;
    containerId: string;
    exposedPort: number;
    url: string;
    internalPort: number;
    image: string;
    env: Record<string, string>;
}
export {};
//# sourceMappingURL=dockerTypes.d.ts.map