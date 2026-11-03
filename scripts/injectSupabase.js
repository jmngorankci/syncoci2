const path = require('path');
const fs = require('fs');
const { createClient } = require(path.resolve('c:/Antigravity/synco2/node_modules/@supabase/supabase-js'));

const envContent = fs.readFileSync('c:\\Antigravity\\synco2\\.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const key = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log('--- INJECTION SUPABASE DISTANTE ---');
console.log('Projet:', url);

if (!url || url.includes('your-project-id')) {
  console.error('Erreur : URL Supabase non configurée dans .env.local');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false }
});

const data = require('C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\98360297-79ae-4380-9aab-0725e1033ffc\\scratch\\all_data.json');

async function inject() {
  try {
    console.log('\n1. Envoi des 4 secteurs...');
    const { error: errSec } = await supabase.from('secteurs').upsert(data.secteurs);
    if (errSec) throw new Error('Secteurs: ' + errSec.message);
    console.log('✓ Secteurs insérés');

    console.log('\n2. Envoi de l\'activité...');
    const { error: errAct } = await supabase.from('activites').upsert(data.activites);
    if (errAct) throw new Error('Activités: ' + errAct.message);
    console.log('✓ Activité insérée');

    console.log(`\n3. Envoi des ${data.proprietaires.length} copropriétaires...`);
    for (let i = 0; i < data.proprietaires.length; i += 50) {
      const chunk = data.proprietaires.slice(i, i + 50);
      const { error } = await supabase.from('proprietaires').upsert(chunk);
      if (error) throw new Error(`Proprietaires chunk ${i}: ${error.message}`);
      process.stdout.write(`.`);
    }
    console.log('\n✓ Copropriétaires insérés');

    console.log(`\n4. Envoi des ${data.paiements.length} paiements...`);
    for (let i = 0; i < data.paiements.length; i += 200) {
      const chunk = data.paiements.slice(i, i + 200);
      const { error } = await supabase.from('paiements').upsert(chunk);
      if (error) throw new Error(`Paiements chunk ${i}: ${error.message}`);
      process.stdout.write(`.`);
    }
    console.log('\n✓ Paiements insérés');

    console.log('\n==========================================');
    console.log('INJECTION REUSSIE AVEC SUCCES DANS SUPABASE !');
    console.log('==========================================');
  } catch (err) {
    console.error('\nEchec de l\'injection :', err.message);
  }
}

inject();
