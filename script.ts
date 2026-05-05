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
    // Replace non-glass backgrounds with glass-card
    content = content.replace(/bg-white dark:bg-\[[^\]]+\]/g, 'glass-card text-slate-900 dark:text-slate-100');
    content = content.replace(/bg-white dark:bg-slate-[0-9]+/g, 'glass-card text-slate-900 dark:text-slate-100');
    content = content.replace(/bg-white dark:bg-white\/[0-5]+/g, 'glass-card text-slate-900 dark:text-slate-100');
    // Remove conflicting borders as glass-card has its own
    content = content.replace(/border border-slate-200 dark:border-white\/[0-9]+/g, '');
    content = content.replace(/border border-slate-[0-9]+ dark:border-slate-[0-9]+/g, '');
    
    // Clean up duplicate glass-card classes if any
    content = content.replace(/glass-card\s+glass-card/g, 'glass-card');
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
