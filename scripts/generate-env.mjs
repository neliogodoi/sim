import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const outputPath = resolve('src/environments/environment.generated.ts');
const localEnv = readEnvFile(resolve('.env'));

const env = {
  ...localEnv,
  ...process.env,
};

const r2UploadUrl = env.R2_UPLOAD_URL || '';
const r2UploadToken = env.R2_UPLOAD_TOKEN || '';
const asaasApiUrl = env.ASAAS_API_URL || '';

mkdirSync(dirname(outputPath), { recursive: true });

writeFileSync(
  outputPath,
  `export const generatedEnvironment = {
  r2Upload: {
    url: ${JSON.stringify(r2UploadUrl)},
    token: ${JSON.stringify(r2UploadToken)},
  },
  asaas: {
    apiUrl: ${JSON.stringify(asaasApiUrl)},
  },
};
`,
);

function readEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((result, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) {
        return result;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
      result[key] = value;
      return result;
    }, {});
}
