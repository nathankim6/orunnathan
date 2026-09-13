import { createClient } from '@supabase/supabase-js';

// Supabase connection comes from the environment (same public values as .env):
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... node temp/analyze_sungnam.js
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !anonKey) {
  console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY (or the VITE_* equivalents) before running this script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

const workbookId = '2ba8fb56-c7b0-4fe5-af65-3f63dcf20a9a';
const targetDays = [14,15,16,17,18,19,20,21,22,23,24,25];

function splitMeanings(meaning) {
  if (!meaning) return [];
  return meaning
    .replace(/^\([a-z.]+\)\s*/i, '')
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(Boolean);
}

async function main() {
  const { data, error } = await supabase.rpc('load_workbook_data', { p_workbook_id: workbookId });
  if (error) { console.error(error); return; }
  const dayGroups = data.day_groups || [];
  const selected = dayGroups.filter(dg => {
    const n = parseInt(String(dg.day_name).replace(/\D/g, ''), 10);
    return targetDays.includes(n);
  });
  const headwords = [];
  for (const dg of selected) {
    for (const w of dg.words || []) {
      if (!w.word_type || w.word_type === '표제어') {
        headwords.push({ day: dg.day_name, word: w });
      }
    }
  }
  const polysemous = headwords.filter(({ word }) => splitMeanings(word.meaning).length >= 3);
  console.log('Headwords total:', headwords.length);
  console.log('Polysemous words:', polysemous.length);
  for (const { word } of polysemous) {
    const meanings = splitMeanings(word.meaning);
    console.log(`${word.word} (${word.day}) [${meanings.length}] ${word.meaning}`);
  }
  console.log('---');
  const WORDS_PER_PAGE = 8;
  const pages = Math.ceil(polysemous.length / WORDS_PER_PAGE);
  console.log('Pages needed at 8 words per page:', pages);
  const maxRowsPerPage = WORDS_PER_PAGE * 4;
  console.log('Max rows per page (if all 4 meanings):', maxRowsPerPage);
  // Distribution of meaning counts
  const counts = {};
  for (const { word } of polysemous) {
    const n = splitMeanings(word.meaning).length;
    counts[n] = (counts[n] || 0) + 1;
  }
  console.log('Meaning count distribution:', counts);
}
main();
