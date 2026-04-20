const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'app', 'styles');
const filesToClean = ['settings.css', 'profile.css', 'postView.css', 'colonias.css'];

filesToClean.forEach(file => {
  const filePath = path.join(cssDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip everything up to /* estructura principal */
  const splitPoint = '/* estructura principal */';
  const parts = content.split(splitPoint);
  
  if (parts.length > 1) {
    // Keep everything after it. We don't want to keep root vars if they are duplicated since homeStyles.css has them, 
    // but wait, homeStyles.css is loaded globally anyway. Let's just trust homeStyles.css.
    content = parts[1];
  }

  // We also need to strip responsive layout code for sidebar-left and top-nav inside @media
  // Since it's regex we can just replace known blocks.
  content = content.replace(/\.top-nav\s*\{[^}]+\}/g, '');
  content = content.replace(/\.sidebar-left\s*\{[^}]+\}/g, '');
  content = content.replace(/\.main-menu a \w*\s*\{[^}]+\}/g, '');
  content = content.replace(/\.main-menu a\s*\{[^}]+\}/g, '');
  content = content.replace(/\.main-menu\s*\{[^}]+\}/g, '');
  content = content.replace(/\.search-bar(?: input)?\s*\{[^}]+\}/g, '');
  content = content.replace(/body\.sidebar-open[^{]*\{[^}]+\}/g, '');
  content = content.replace(/body\.sidebar-closed[^{]*\{[^}]+\}/g, '');
  // also clean up any empty @media blocks
  content = content.replace(/@media[^{]+\{\s*\}/g, '');

  fs.writeFileSync(filePath, content);
  console.log(`Cleaned ${file}`);
});
