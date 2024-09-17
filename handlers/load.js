const fs = require('fs');
const path = require('path');

function loadFolder(folderPath) {
    const loadedFiles = {};
    const absoluteFolderPath = path.resolve(folderPath);
    
    // console.warn(`Loading from: ${absoluteFolderPath}`);

    if (!fs.existsSync(absoluteFolderPath)) {
        console.error(`Directory does not exist: ${absoluteFolderPath}`);
        return loadedFiles;
    }

    const files = fs.readdirSync(absoluteFolderPath);

    files.forEach(file => {
        const fullPath = path.join(absoluteFolderPath, file);
        const stat = fs.statSync(fullPath);

        // Only load files, not directories
        if (stat.isFile() && file.endsWith('.js')) {
            const fileName = path.basename(file, '.js');
            try {
                loadedFiles[fileName] = require(fullPath);
            } catch (error) {
                console.error(`Failed to load module ${fileName}:`, error);
            }
        }
    });

    return loadedFiles;
}

module.exports = { loadFolder };