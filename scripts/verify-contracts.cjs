const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function readJson(file) {
    return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function readText(file) {
    return fs.readFileSync(path.join(root, file), 'utf8');
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertSameJson(actual, expected, label) {
    assert(
        JSON.stringify(actual || {}) === JSON.stringify(expected || {}),
        `${label} in package-lock.json does not match package.json`
    );
}

const packageJson = readJson('package.json');
const packageLock = readJson('package-lock.json');
const lockRoot = packageLock.packages && packageLock.packages[''];

assert(lockRoot, 'package-lock.json is missing the root package entry');
assert(lockRoot.name === packageJson.name, 'package-lock.json root package name does not match package.json');
assert(lockRoot.version === packageJson.version, 'package-lock.json root package version does not match package.json');
assertSameJson(lockRoot.dependencies, packageJson.dependencies, 'dependencies');
assertSameJson(lockRoot.devDependencies, packageJson.devDependencies, 'devDependencies');
assertSameJson(lockRoot.peerDependencies, packageJson.peerDependencies, 'peerDependencies');

assert(packageJson.main === './dist/turntable-viewer.umd.cjs', 'package.json main must point to the UMD/CommonJS build');
assert(packageJson.module === './dist/turntable-viewer.esm.js', 'package.json module must point to the ESM build');
assert(packageJson.exports['.'].import === './dist/turntable-viewer.esm.js', 'package.json exports.import must point to the ESM build');
assert(packageJson.exports['.'].require === './dist/turntable-viewer.umd.cjs', 'package.json exports.require must point to the UMD/CommonJS build');

const viteConfig = readText('vite.config.ts');
assert(viteConfig.includes("if (format === 'es') return 'turntable-viewer.esm.js';"), 'vite ESM output name does not match package.json/README');
assert(viteConfig.includes("if (format === 'umd') return 'turntable-viewer.umd.cjs';"), 'vite UMD output name does not match package.json');

const publicScriptUrl = `https://cdn.jsdelivr.net/gh/NegativeMind/web-turntable-viewer-widget@v${packageJson.version}/dist/turntable-viewer.esm.js`;
const publicFiles = [
    'README.md',
    'embed-generator/script.ts',
    'tests/test-cdn.html',
    '.github/copilot-instructions.md',
];

for (const file of publicFiles) {
    const text = readText(file);
    assert(text.includes(publicScriptUrl), `${file} must reference the versioned jsDelivr widget URL`);
    assert(!text.includes('https://negativemind.com/web-turntable-viewer-widget/dist/turntable-viewer.esm.js'), `${file} must use a versioned widget URL instead of latest`);
}

const gitignore = readText('.gitignore');
assert(/^dist\/$/m.test(gitignore), '.gitignore must keep dist/ out of regular commits');

const elementSource = readText('src/turntable-viewer-element.ts');
assert(elementSource.includes('normalizeDimensionAttribute'), 'turntable-viewer element must validate width/height attributes');
assert(elementSource.includes('MAX_DIMENSION_PX'), 'turntable-viewer element must clamp unreasonable dimensions');

const playerInitializer = readText('src/player-initializer.ts');
assert(playerInitializer.includes('Vimeo Player API script is required'), 'player initializer must give a clear missing Vimeo API error');

console.log('Contract checks passed.');
