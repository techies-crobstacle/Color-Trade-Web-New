const fs = require('fs');
const file = 'src/Components/AdminPanelComponents/GameStats.tsx';
let content = fs.readFileSync(file, 'utf8');

// The replacement string accidentally broke the jsx at the bottom.
// We injected UnifiedDashboardPanel successfully, but let's check its end.
const megaDashStart = content.indexOf('function UnifiedDashboardPanel');
console.log(content.slice(megaDashStart-10, megaDashStart+10));
