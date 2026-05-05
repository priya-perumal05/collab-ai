import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src/components/ui', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    content = content.replace(/" import/g, '"; import');
    content = content.replace(/" interface/g, '"; interface');
    content = content.replace(/" export/g, '"; export');
    content = content.replace(/" const/g, '"; const');
    content = content.replace(/\) Button\.displayName/g, '); Button.displayName');
    content = content.replace(/\) Avatar\.displayName/g, '); Avatar.displayName');
    content = content.replace(/\) Progress\.displayName/g, '); Progress.displayName');
    content = content.replace(/" export/g, '"; export');
    content = content.replace(/"$/g, '";');
    
    // Some components might have `} ) Component.displayName = ...`
    content = content.replace(/} \) ([A-Za-z]+)\.displayName/g, '} ); $1.displayName');
    
    // Fix Card 
    content = content.replace(/\) Card\.displayName/g, '); Card.displayName');
    content = content.replace(/\) CardHeader\.displayName/g, '); CardHeader.displayName');
    content = content.replace(/\) CardTitle\.displayName/g, '); CardTitle.displayName');
    content = content.replace(/\) CardDescription\.displayName/g, '); CardDescription.displayName');
    content = content.replace(/\) CardContent\.displayName/g, '); CardContent.displayName');
    content = content.replace(/\) CardFooter\.displayName/g, '); CardFooter.displayName');
    
    // Fix string endings that lack an instruction separation
    content = content.replace(/" const/g, '"; const');
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed syntax in', filePath);
    }
  }
});
