import { execSync } from 'node:child_process';

async function globalSetup() {
  console.log('Global Setup: Seeding database...');
  execSync('yarn init:db', { stdio: 'inherit' });
}

export default globalSetup;
