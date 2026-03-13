/**
 * Script de diagnostic complet pour n8n
 * Usage: node n8n-server/scripts/diagnose.js
 */

const BACKEND_URL = 'http://localhost:3458';
const N8N_URL = 'http://localhost:5678';
const N8N_WEBHOOK = 'http://localhost:5678/webhook/template';

async function checkPort(url, name) {
  try {
    const response = await fetch(url, { method: 'GET' });
    console.log(`✅ ${name} is accessible (status: ${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} is NOT accessible: ${error.message}`);
    return false;
  }
}

async function testBackendHealth() {
  console.log('\n📋 Test 1: Backend Health Check');
  console.log('-'.repeat(60));
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function testN8nWebhook() {
  console.log('\n📋 Test 2: N8n Webhook Direct Call');
  console.log('-'.repeat(60));
  console.log('URL:', N8N_WEBHOOK);
  
  try {
    const response = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: 'Test de diagnostic',
      }),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('Response (text):', text.substring(0, 500));
    }

    return response.ok;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function testBackendExecute() {
  console.log('\n📋 Test 3: Backend Execute Endpoint');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/n8n/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: 'Test de diagnostic via backend',
        attachments: [],
      }),
    });

    console.log('Status:', response.status);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    return response.ok && data.success;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🔍 DIAGNOSTIC N8N COMPLET');
  console.log('='.repeat(60));

  // Check if services are running
  console.log('\n🔌 Vérification des services...');
  console.log('-'.repeat(60));
  
  const backendRunning = await checkPort(BACKEND_URL, 'Backend (port 3458)');
  const n8nRunning = await checkPort(N8N_URL, 'n8n (port 5678)');

  if (!backendRunning) {
    console.log('\n⚠️  Le backend n8n n\'est pas démarré!');
    console.log('Démarrez-le avec: npm run start:all');
    process.exit(1);
  }

  if (!n8nRunning) {
    console.log('\n⚠️  Le serveur n8n n\'est pas démarré!');
    console.log('Démarrez-le avec: n8n start');
    process.exit(1);
  }

  // Run tests
  await testBackendHealth();
  await testN8nWebhook();
  await testBackendExecute();

  console.log('\n' + '='.repeat(60));
  console.log('✅ Diagnostic terminé');
  console.log('='.repeat(60));
  console.log('\n💡 Conseils:');
  console.log('1. Vérifiez que le workflow n8n est ACTIF');
  console.log('2. Vérifiez que l\'URL du webhook est correcte: /webhook/template');
  console.log('3. Consultez les logs du backend pour plus de détails');
}

main().catch(console.error);