import app from './app.js';
import config from './config/config.js';
import connectToDb from './config/db.js';

app.listen(config.port, async () => {
  await connectToDb();
  console.log(`Server running on port ${config.port}`);
});
