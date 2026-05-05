import { execSync } from 'child_process';
try {
  execSync('git checkout src/', { stdio: 'inherit' });
  console.log("git checkout src/ completed");
} catch (e) {
  console.log("Failed to git checkout src/: ", e);
}
