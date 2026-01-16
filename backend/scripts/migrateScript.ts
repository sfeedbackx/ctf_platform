
import { type HydratedDocument } from 'mongoose';
import type { containerConfig } from '../src/types/dockerTypes.js';
import { serviceType } from '../src/types/enums.js';
import { ctfDifficulty, type Ictf } from '../src/types/ctfTypes.js';
import Ctf from '../src/models/ctfModel.js';
import configEnv from '../src/config/config.js';
import connectToDb from '../src/config/db.js';
function isMongoBulkWriteError(err: unknown): err is {
  name: string;
  code?: number;
  message: string;
  writeErrors?: Array<{ index: number; err: unknown }>;
} {
  return err instanceof Error && err.name === 'MongoBulkWriteError';
}
const config0: containerConfig = {
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

const config1: containerConfig = {
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
    VITE_FLAG: configEnv.ssrfFlag
  },
  labels: {
    expiresAt: '',
    ctf_challenge: '',
    ctf_user: '',
  },
};
const containersConfig: containerConfig[] = [config0, config1];

const ctfChallenges: Ictf[] = [];

ctfChallenges.push(
  {
    name: 'SSRF-RACE',
    withSite: true,
    containersConfig: containersConfig,
    description: 'Who said education has to be expensive? This platform seems to handle enrollment and pricing automatically. Still, nothing is ever as perfect as it looks.',
    difficulty: ctfDifficulty.MID,
    flag: 'cll{ss098fud63c2xgXPuVPimY3ZmkDmFsI+RfhCdqccOZwJKBqQI=}',
    type: 'WEB_EXPLOIT',
    resources: [],
    hints: ['Hint 1: The server talks to itself. What happens when you make it ask the right questions?',
      'Hint 2: Speed beats logic. Sometimes clicking faster than the server can think pays off.'
    ],
  },
  {
    name: 'Steganography_basics',
    withSite: false,
    description: 'Do you know what is steganography ?',
    difficulty: ctfDifficulty.EASY,
    flag: 'cll{Fqj1Lkirsyi2sLn0O7aX1NIoYZggKuvy8MEfx1sU/PI=}',
    type: 'FORENSICS',
    resources: ['127.0.0.1:6650'],
    hints: [],
  },
  {
    name: 'STEGANOGRAPHY2',
    withSite: false,
    description: "So you know Steganography basics but didn't we deserve 20 ?",
    difficulty: ctfDifficulty.MID,
    flag: 'cll{iVwbTtAoYXciA486sEXwGMT1geaJOym3pIsEGeQQQNg=}',
    type: 'FORENSICS',
    resources: ['127.0.0.1:6600'],
    hints: [
      'Hint 1 : i can see the password there ! ',
      'Hint 2 : really! we deserve 20'
    ],
  }
);

const cleanCtfCollection = async () => {
  console.log('deleting ctf collection...');
  try {
    await Ctf.deleteMany({});
    console.log('Collection docs dropped successfully');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(
        'Collection docs does not exist — skipping drop',
        err.message,
      );
    } else {
      console.error('Unknown error');
    }
  }
};

const migrate = async (ctfChallenges: Ictf[]) => {
  console.log('performing seeding...');
  try {
    const res: HydratedDocument<Ictf>[] = await Ctf.insertMany(ctfChallenges);
    console.log('Inserted docs with success', res.length);
    process.exit(0);
  } catch (err: unknown) {
    if (isMongoBulkWriteError(err)) {
      console.error('Failed to insert docs', err.code);
    } else {
      console.error('Failed to insert docs', err);
    }
    process.exit(1);
  }
};

await connectToDb();
await cleanCtfCollection();
await migrate(ctfChallenges);
