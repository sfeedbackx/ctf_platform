import app from './app.js';
import configEnv from './config/config.js';
import connectToDb from './config/db.js';
import { scheduleCleanup } from './utils/cronUtils.js';

app.listen(configEnv.port, async () => {
  await connectToDb();
  console.log(`[INFO] Server running on port ${configEnv.port}`);
  scheduleCleanup();
});
