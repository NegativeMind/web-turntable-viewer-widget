/**
 * git hooks のインストールと dist/ の skip-worktree 設定を行うスクリプト
 * npm install (prepare) 時に自動実行されます
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
const scriptsDir = __dirname;

// .git が存在しない環境（CI等）ではスキップ
if (!fs.existsSync(hooksDir)) {
    process.exit(0);
}

// --- 1. git hooks のインストール ---
const hooks = ['pre-commit'];
for (const hook of hooks) {
    const src = path.join(scriptsDir, hook);
    const dest = path.join(hooksDir, hook);
    try {
        fs.copyFileSync(src, dest);
        fs.chmodSync(dest, '755');
        console.log(`✓ Git hook installed: ${hook}`);
    } catch (e) {
        console.warn(`⚠ Could not install git hook (${hook}):`, e.message);
    }
}

// --- 2. dist/ を skip-worktree に設定 ---
// tracked な dist/ ファイルをローカルビルドの差分として表示しない
// （GitHub Desktop 等の GUI ツールでも変更として表示されなくなる）
try {
    const tracked = execSync('git ls-files dist/', { encoding: 'utf8' }).trim();
    if (tracked) {
        const files = tracked.split('\n').filter(Boolean);
        for (const file of files) {
            execSync(`git update-index --skip-worktree "${file}"`);
        }
        console.log(`✓ skip-worktree applied to ${files.length} dist/ file(s) (hidden from GitHub Desktop)`);
    } else {
        console.log('  dist/ has no tracked files yet (will apply after first CI build)');
    }
} catch (e) {
    console.warn('⚠ Could not apply skip-worktree to dist/:', e.message);
}
