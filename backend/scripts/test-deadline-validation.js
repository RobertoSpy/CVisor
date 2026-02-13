/**
 * Test pentru validarea deadline-ului
 * Usage: node scripts/test-deadline-validation.js
 *
 * Testează că backend-ul respinge oportunități cu deadline în trecut
 */

require('dotenv').config();

console.log('\n📝 Test Validare Deadline - Simulare\n');

// Simulare validare (fără a accesa DB-ul)
function validateDeadline(deadlineString) {
  const deadlineDate = new Date(deadlineString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return deadlineDate >= today;
}

// Test cases
const testCases = [
  { deadline: '2020-01-01', expected: false, description: 'Dată veche (2020)' },
  { deadline: '2024-01-01', expected: false, description: 'Anul trecut' },
  { deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], expected: false, description: 'Acum 7 zile' },
  { deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], expected: false, description: 'Ieri' },
  { deadline: new Date().toISOString().split('T')[0], expected: true, description: 'Astăzi (VALID)' },
  { deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], expected: true, description: 'Mâine (VALID)' },
  { deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], expected: true, description: '+30 zile (VALID)' },
  { deadline: '2030-12-31', expected: true, description: 'Viitor depărtat (VALID)' }
];

console.log('🧪 Rulare teste...\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = validateDeadline(test.deadline);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';

  if (result === test.expected) {
    passed++;
  } else {
    failed++;
  }

  console.log(`${index + 1}. ${status} - ${test.description}`);
  console.log(`   Deadline: ${test.deadline}`);
  console.log(`   Expected: ${test.expected ? 'VALID' : 'INVALID'}, Got: ${result ? 'VALID' : 'INVALID'}\n`);
});

console.log('─'.repeat(50));
console.log(`📊 Rezultate: ${passed}/${testCases.length} teste PASSED`);

if (failed > 0) {
  console.log(`⚠️  ${failed} teste FAILED!\n`);
  process.exit(1);
} else {
  console.log('✅ Toate testele au TRECUT!\n');
  console.log('💡 Următorii pași:');
  console.log('   1. Restart backend: npm run dev');
  console.log('   2. Testează în UI crearea oportunității');
  console.log('   3. Încearcă să setezi deadline-ul la o dată trecută\n');
}
