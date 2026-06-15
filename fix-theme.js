import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/pages');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix the main wrappers
  content = content.replace(/className="(.*?)bg-surface-900(.*?)text-slate-100(.*?)"/g, 'className="$1bg-slate-50 dark:bg-surface-900 text-slate-900 dark:text-slate-100$2$3"');
  content = content.replace(/className="(.*?)bg-surface-900(.*?)"/g, 'className="$1bg-slate-50 dark:bg-surface-900$2"');
  
  // Fix specific occurrences
  content = content.replace(/bg-surface-900\/80/g, 'bg-white/80 dark:bg-surface-900/80');
  content = content.replace(/text-slate-100/g, 'text-slate-900 dark:text-slate-100');
  
  // Cleanup duplicates that might have been created
  content = content.replace(/bg-slate-50 dark:bg-slate-50 dark:bg-surface-900/g, 'bg-slate-50 dark:bg-surface-900');
  content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-slate-100/g, 'text-slate-900 dark:text-slate-100');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed themes across pages.');
