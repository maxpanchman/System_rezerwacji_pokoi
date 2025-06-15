import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Function to copy file with error handling
function copyFile(src, dest) {
    try {
        fs.copyFileSync(src, dest);
        console.log(`Successfully copied ${src} to ${dest}`);
    } catch (err) {
        console.error(`Error copying ${src} to ${dest}:`, err);
    }
}

// Copy files
const files = [
    { src: path.join(__dirname, '..', 'index.html'), dest: path.join(publicDir, 'index.html') },
    { src: path.join(__dirname, '..', 'style.css'), dest: path.join(publicDir, 'style.css') },
    { src: path.join(__dirname, '..', 'dist', 'bundle.js'), dest: path.join(publicDir, 'bundle.js') }
];

files.forEach(file => {
    if (fs.existsSync(file.src)) {
        copyFile(file.src, file.dest);
    } else {
        console.error(`Source file not found: ${file.src}`);
    }
});