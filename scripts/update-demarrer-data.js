/**
 * Script to update DemarrerMenu with complete data from source file
 * Replaces Lucide icons with UnoCSS Carbon icons
 */

const fs = require('fs');
const path = require('path');

// Icon mapping: Lucide -> UnoCSS Carbon
const iconMap = {
  '<Briefcase className="w-4 h-4" />': '<span className="i-carbon-briefcase w-4 h-4" />',
  '<Calculator className="w-4 h-4" />': '<span className="i-carbon-calculator w-4 h-4" />',
  '<Map className="w-4 h-4" />': '<span className="i-carbon-map w-4 h-4" />',
  '<Shield className="w-4 h-4" />': '<span className="i-carbon-security w-4 h-4" />',
  '<FileText className="w-4 h-4" />': '<span className="i-carbon-document w-4 h-4" />',
  '<FileCheck className="w-4 h-4" />': '<span className="i-carbon-document-tasks w-4 h-4" />',
  '<AlertTriangle className="w-4 h-4" />': '<span className="i-carbon-warning w-4 h-4" />',
  '<FileSearch className="w-4 h-4" />': '<span className="i-carbon-search w-4 h-4" />',
  '<CheckSquare className="w-4 h-4" />': '<span className="i-carbon-checkbox-checked w-4 h-4" />',
  '<Target className="w-4 h-4" />': '<span className="i-carbon-target w-4 h-4" />',
  '<BarChart3 className="w-4 h-4" />': '<span className="i-carbon-chart-bar w-4 h-4" />',
  '<Settings className="w-4 h-4" />': '<span className="i-carbon-settings w-4 h-4" />',
  '<Cog className="w-4 h-4" />': '<span className="i-carbon-settings-adjust w-4 h-4" />',
  '<TrendingUp className="w-4 h-4" />': '<span className="i-carbon-trending-up w-4 h-4" />',
  '<User className="w-4 h-4" />': '<span className="i-carbon-user w-4 h-4" />',
  '<Package className="w-4 h-4" />': '<span className="i-carbon-package w-4 h-4" />',
  '<Building className="w-4 h-4" />': '<span className="i-carbon-building w-4 h-4" />',
  '<Users className="w-4 h-4" />': '<span className="i-carbon-user-multiple w-4 h-4" />',
  '<Truck className="w-4 h-4" />': '<span className="i-carbon-delivery-truck w-4 h-4" />',
  '<UserCheck className="w-4 h-4" />': '<span className="i-carbon-user-certification w-4 h-4" />',
  '<PiggyBank className="w-4 h-4" />': '<span className="i-carbon-piggy-bank w-4 h-4" />',
  '<Receipt className="w-4 h-4" />': '<span className="i-carbon-receipt w-4 h-4" />',
  '<HelpCircle className="w-4 h-4" />': '<span className="i-carbon-help w-4 h-4" />',
  '<GraduationCap className="w-4 h-4" />': '<span className="i-carbon-education w-4 h-4" />',
  '<BookOpen className="w-4 h-4" />': '<span className="i-carbon-book w-4 h-4" />',
  '<ClipboardList className="w-4 h-4" />': '<span className="i-carbon-list-checked w-4 h-4" />',
};

console.log('📦 Reading extracted menu data...');
let menuData = fs.readFileSync('extracted_menu_data.txt', 'utf8');

console.log('🔄 Replacing Lucide icons with UnoCSS Carbon icons...');
let replacementCount = 0;
for (const [lucide, unocss] of Object.entries(iconMap)) {
  const count = (menuData.match(new RegExp(lucide.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count > 0) {
    menuData = menuData.split(lucide).join(unocss);
    replacementCount += count;
    console.log(`  ✓ Replaced ${count}x ${lucide.match(/<(\w+)/)[1]}`);
  }
}
console.log(`✅ Total replacements: ${replacementCount}`);

console.log('📝 Reading current DemarrerMenu component...');
const componentPath = 'src/renderer/components/DemarrerMenu.tsx';
let component = fs.readFileSync(componentPath, 'utf8');

console.log('🔍 Finding MENU_DATA section...');
const lines = component.split('\n');
const startIndex = lines.findIndex(l => l.includes('const MENU_DATA: LogicielItem[]'));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.trim() === '];');

if (startIndex === -1 || endIndex === -1) {
  console.error('❌ Could not find MENU_DATA section in component');
  process.exit(1);
}

console.log(`  Found at lines ${startIndex + 1} to ${endIndex + 1}`);

console.log('✂️  Replacing MENU_DATA...');
const newComponent = [
  ...lines.slice(0, startIndex),
  ...menuData.split('\n'),
  ...lines.slice(endIndex + 1)
].join('\n');

console.log('💾 Writing updated component...');
fs.writeFileSync(componentPath, newComponent, 'utf8');

console.log('✅ DemarrerMenu component updated successfully!');
console.log(`   Lines before: ${lines.length}`);
console.log(`   Lines after: ${newComponent.split('\n').length}`);
console.log(`   Data lines added: ${menuData.split('\n').length - (endIndex - startIndex + 1)}`);
