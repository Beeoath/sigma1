import fs from 'fs';
import path from 'path';

const calls = [];
function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) scan(p);
    else if (p.endsWith('.js') || p.endsWith('.jsx')) {
      const code = fs.readFileSync(p, 'utf8');
      const lines = code.split('\n');
      lines.forEach((line, i) => {
        if (line.includes('api(')) {
          calls.push({ file: path.relative('extracted', p), line: i + 1, text: line.trim() });
        }
      });
    }
  }
}
scan('extracted');
console.log(`Found ${calls.length} api() calls:`);
calls.forEach(c => console.log(`${c.file}:${c.line} -> ${c.text}`));
