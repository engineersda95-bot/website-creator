/**
 * ONE-TIME MIGRATION SCRIPT — usa fetch diretto, zero dipendenze
 * Dopo l'uso: cancella questo file o rimuovi SERVICE_ROLE_KEY
 *
 * Dry run:  node scripts/migrate-storage-paths.mjs --dry
 * Reale:    node scripts/migrate-storage-paths.mjs
 */

// ⚠️  CANCELLA SERVICE_ROLE_KEY DOPO L'USO
const SUPABASE_URL = 'https://qnwsegsnbeajqcuoezzm.supabase.co';
const SERVICE_ROLE_KEY = 'DA INSERIRE';
const USER_ID = 'd037b20d-cba5-4927-af47-43ac2b5d49c0';
const BUCKET = 'project-assets';
const DRY_RUN = process.argv.includes('--dry');

const HEADERS = {
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'apikey': SERVICE_ROLE_KEY,
  'Content-Type': 'application/json',
};

async function listFiles(prefix) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ prefix, limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!res.ok) throw new Error(`list("${prefix}") ${res.status}: ${await res.text()}`);
  return res.json();
}

async function copyFile(from, to) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/copy`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ bucketId: BUCKET, sourceKey: from, destinationKey: to }),
  });
  if (!res.ok) {
    const txt = await res.text();
    if (txt.includes('already exists')) return 'exists';
    throw new Error(`copy ${res.status}: ${txt}`);
  }
  return 'ok';
}

async function deleteFiles(paths) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: HEADERS,
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!res.ok) throw new Error(`delete ${res.status}: ${await res.text()}`);
}

async function deleteFolder(prefix) {
  const items = await listFiles(prefix);
  for (const item of items) {
    const fullPath = `${prefix}/${item.name}`;
    if (!item.id) {
      await deleteFolder(fullPath);
    } else {
      if (DRY_RUN) { console.log(`  [DRY] elimina: ${fullPath}`); continue; }
      await deleteFiles([fullPath]);
      console.log(`  ✅  eliminato: ${fullPath}`);
    }
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function main() {
  console.log(`\n=== Migrazione Storage${DRY_RUN ? ' [DRY RUN]' : ''} — user: ${USER_ID} ===\n`);

  const topLevel = await listFiles('');
  const folders = topLevel.filter(i => !i.id).map(i => i.name);
  console.log(`Cartelle trovate: ${folders.join(', ')}\n`);

  let copied = 0, errors = 0;

  for (const folder of folders) {
    if (folder === 'ai-temp') continue;
    if (!UUID_RE.test(folder)) { console.log(`  [SKIP] "${folder}" non è un project-id`); continue; }

    const files = (await listFiles(folder)).filter(f => f.id);
    if (!files.length) { console.log(`  [SKIP] ${folder} — vuota`); continue; }

    console.log(`  ${folder}: ${files.length} file → ${USER_ID}/${folder}/`);

    for (const file of files) {
      const src = `${folder}/${file.name}`;
      const dst = `${USER_ID}/${folder}/${file.name}`;
      if (DRY_RUN) { console.log(`    [DRY] ${src} → ${dst}`); copied++; continue; }
      try {
        const r = await copyFile(src, dst);
        if (r === 'exists') { console.log(`    ⏭️   già esistente: ${dst}`); }
        else { console.log(`    ✅  ${src} → ${dst}`); }
        copied++;
      } catch (e) { console.error(`    ❌  ${src}: ${e.message}`); errors++; }
    }
  }

  console.log('\n--- Pulizia ai-temp/ ---\n');
  const aiTemp = await listFiles('ai-temp');
  if (!aiTemp.length) { console.log('  ai-temp/ già vuota.\n'); }
  else { await deleteFolder('ai-temp'); }

  console.log(`\n=== Fine — copiati: ${copied}, errori: ${errors} ===`);
  if (!DRY_RUN) console.log('  ⚠️  Ricordati di rimuovere SERVICE_ROLE_KEY dallo script!');
}

main().catch(e => { console.error('Errore:', e.message); process.exit(1); });
