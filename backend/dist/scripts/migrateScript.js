import {} from 'mongoose';
import { serviceType } from '../src/types/enums.js';
import { ctfDifficulty } from '../src/types/ctfTypes.js';
import Ctf from '../src/models/ctfModel.js';
import connectToDb from '../src/config/db.js';
function isMongoBulkWriteError(err) {
    return err instanceof Error && err.name === 'MongoBulkWriteError';
}
const config = {
    image: 'ctf_ssrf_race_backend',
    name: 'ssrf_race_backend',
    type: serviceType.BACKEND,
    internalPort: 5000,
    exposed: false,
    networkMode: 'ctf_ssrf_race',
    labels: {
        expiresAt: '',
        ctf_challenge: '',
        ctf_user: '',
    },
};
const config1 = {
    image: 'ctf_ssrf_race_frontend',
    name: 'ssrf_race_frontend',
    type: serviceType.FRONTEND,
    exposedPort: 8080,
    internalPort: 80,
    exposed: true,
    networkMode: 'ctf_ssrf_race',
    env: {
        BACKEND_HOST: 'ctf_ssrf',
        BACKEND_PORT: '5000',
    },
    labels: {
        expiresAt: '',
        ctf_challenge: '',
        ctf_user: '',
    },
};
const containersConfig = [config, config1];
const ctfChallenges = [];
ctfChallenges.push({
    name: 'SSRF-RACE',
    withSite: true,
    containersConfig: containersConfig,
    description: 'Who said education has to be expensive? This platform seems to handle enrollment and pricing automatically. Still, nothing is ever as perfect as it looks.',
    difficulty: ctfDifficulty.MID,
    flag: `CTF{flag_1_${Math.random().toString(36).substring(7)}}`,
    type: 'WEB_EXPLOIT',
    resources: [],
    hints: ['Hint 1: The server talks to itself. What happens when you make it ask the right questions?',
        'Hint 2: Speed beats logic. Sometimes clicking faster than the server can think pays off.'
    ],
});
const cleanCtfCollection = async () => {
    console.log('deleting ctf collection...');
    try {
        await Ctf.deleteMany({});
        console.log(' Collection docs dropped successfully');
    }
    catch (err) {
        if (err instanceof Error) {
            console.log(' Collection docs does not exist — skipping drop', err.message);
        }
        else {
            console.error('Unknown error');
        }
    }
};
const migrate = async (ctfChallenges) => {
    console.log('performing seeding...');
    try {
        const res = await Ctf.insertMany(ctfChallenges);
        console.log('Inserted docs with success', res.length);
        process.exit(0);
    }
    catch (err) {
        if (isMongoBulkWriteError(err)) {
            console.error('Failed to insert docs', err.code);
        }
        else {
            console.error('Failed to insert docs', err);
        }
        process.exit(1);
    }
};
await connectToDb();
await cleanCtfCollection();
await migrate(ctfChallenges);
//# sourceMappingURL=migrateScript.js.map