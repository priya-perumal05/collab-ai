import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let original = content;
    // We remove border-transparent specifically from Card elements using regex
    content = content.replace(/(<Card[^>]*?)border-transparent/g, '$1');
    content = content.replace(/bg-white\/50 dark:bg-white\/5 backdrop-blur-xl/g, '');
    
    // Clean up empty spaces in classNames
    content = content.replace(/\s+/g, ' ');

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed border-transparent from Card in ${filePath}`);
    }
  }
});
