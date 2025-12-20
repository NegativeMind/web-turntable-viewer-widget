// ビルド後処理: docs/embed-generator/* を docs/* に移動
import { readdirSync, renameSync, rmSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const docsDir = 'docs';
const embedGenDir = join(docsDir, 'embed-generator');

if (existsSync(embedGenDir)) {
    // embed-generator 内のファイルを docs/ に移動
    const files = readdirSync(embedGenDir, { recursive: true });

    for (const file of files) {
        const srcPath = join(embedGenDir, file);
        const destPath = join(docsDir, file);

        try {
            renameSync(srcPath, destPath);
            console.log(`Moved: ${srcPath} → ${destPath}`);
        } catch (err) {
            console.error(`Failed to move ${srcPath}:`, err.message);
        }
    }

    // 空の embed-generator フォルダを削除
    rmSync(embedGenDir, { recursive: true, force: true });
    console.log('\n✓ Successfully moved all files to docs/');
} else {
    console.log('embed-generator folder not found, skipping move operation');
}

// GitHub Pages で Jekyll ビルドを無効化
const nojekyllPath = join(docsDir, '.nojekyll');
writeFileSync(nojekyllPath, '');
console.log('✓ Created .nojekyll file to disable Jekyll processing');
