import fs from 'fs';
import path from 'path';
import { builtinModules } from 'module';

const srcDir = 'src';
const nodeModulesDir = 'node_modules';
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});
const allDeps = new Set([...dependencies, ...devDependencies, ...builtinModules]);

function getFiles(dir) {
    const subdirs = fs.readdirSync(dir);
    const files = subdirs.map((subdir) => {
        const res = path.resolve(dir, subdir);
        return fs.statSync(res).isDirectory() ? getFiles(res) : res;
    });
    return files.reduce((a, f) => a.concat(f), []);
}

const files = getFiles(srcDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
const unresolvable = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
            // Relative import, check if file exists
            const dir = path.dirname(file);
            let resolved = false;
            const possiblePaths = [
                path.resolve(dir, importPath),
                path.resolve(dir, importPath + '.js'),
                path.resolve(dir, importPath + '.jsx'),
                path.resolve(dir, importPath, 'index.js'),
                path.resolve(dir, importPath, 'index.jsx')
            ];
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    resolved = true;
                    break;
                }
            }
            if (!resolved) {
                unresolvable.push({ file, importPath, type: 'relative' });
            }
        } else {
            // Package import
            const pkgName = importPath.split('/')[0].startsWith('@')
                ? importPath.split('/').slice(0, 2).join('/')
                : importPath.split('/')[0];

            if (!allDeps.has(pkgName) && !fs.existsSync(path.join(nodeModulesDir, pkgName))) {
                unresolvable.push({ file, importPath, type: 'package' });
            }
        }
    }
});

console.log(JSON.stringify(unresolvable, null, 2));
