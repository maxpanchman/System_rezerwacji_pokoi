import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', __dirname);

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    console.log('Creating public directory:', publicDir);
    fs.mkdirSync(publicDir);
}

// Copy frontend files
const filesToCopy = [
    { src: '../index.html', dest: 'index.html' },
    { src: '../style.css', dest: 'style.css' },
    { src: '../dist/bundle.js', dest: 'bundle.js' }
];

filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file.src);
    const destPath = path.join(publicDir, file.dest);

    console.log('Checking file:', srcPath);
    if (fs.existsSync(srcPath)) {
        console.log('Copying file from:', srcPath);
        console.log('To:', destPath);
        fs.copyFileSync(srcPath, destPath);
        console.log('Successfully copied:', file.src, 'to', file.dest);
    } else {
        console.error('File not found:', srcPath);
    }
});