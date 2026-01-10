import cron from 'node-cron';
import { containersCleanUp } from '../controller/ctfController.js';
export const scheduleCleanup = () => {
    const isDev = process.env.NODE_ENV === 'development';
    // CTF instances cleanup
    const ctfSchedule = isDev ? '*/10 * * * * *' : '*/5 * * * *';
    cron.schedule(ctfSchedule, async () => {
        await containersCleanUp();
    });
};
//# sourceMappingURL=cronUtils.js.map