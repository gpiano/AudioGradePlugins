/* Run in JavaScriptCore via scripts/test.swift. No npm dependencies. */
(() => {
  function assert(condition, message) { if (!condition) throw new Error(message); }
  const {summarize, sortTracks} = AudioGradeStatistics;
  const empty = summarize({apiVersion: 1, reports: []});
  assert(empty.reportCount === 0 && empty.trackCount === 0 && empty.formats.length === 0, 'empty library');
  const input = {apiVersion: 1, reports: [
    {title: '<script>unsafe</script>', tracks: [
      {title: 'A', format: ' flac ', durationSeconds: 0, sampleRate: 44100, bitsPerSample: 16, integratedLufs: -12},
      {title: 'B', format: 'FLAC', durationSeconds: 120.5, sampleRate: 44100, bitsPerSample: 24, integratedLufs: -8},
      {title: 'C', durationSeconds: null, bitsPerSample: null, integratedLufs: null}]},
    {title: 'Second report', tracks: [{title: 'A', format: 'DSF', durationSeconds: 30, sampleRate: 2822400, bitsPerSample: 1}]}]};
  const before = JSON.stringify(input), result = summarize(input);
  assert(JSON.stringify(input) === before, 'does not mutate the input snapshot');
  assert(result.reportCount === 2 && result.trackCount === 4, 'counts reports and repeated recordings explicitly');
  assert(result.knownDurationSeconds === 150.5 && result.knownDurationCount === 3 && result.unknownDurationCount === 1, 'zero and missing durations');
  assert(result.formats[0].value === 'FLAC' && result.formats[0].count === 2, 'normalizes format labels');
  assert(result.formats.some(x => x.value === null && x.count === 1), 'preserves unavailable format');
  assert(result.bitDepths.some(x => x.value === '1'), 'preserves DSD one-bit samples');
  assert(!('averageLufs' in result), 'does not average logarithmic measurements');
  assert(sortTracks(result.tracks, 'integratedLufs')[0].integratedLufs === -12, 'numeric ascending sorting');
  assert(sortTracks(result.tracks, 'integratedLufs', true)[0].integratedLufs === -8, 'numeric descending sorting');
  assert(sortTracks(result.tracks, 'integratedLufs', true).at(-1).integratedLufs == null, 'missing values remain last');
  assert(summarize({apiVersion: 1, reports: [{tracks: [{durationSeconds: Infinity}, {durationSeconds: -1}]}]}).knownDurationCount === 0, 'rejects invalid durations');
  let rejected = false;
  try { summarize({apiVersion: 2, reports: []}); } catch { rejected = true; }
  assert(rejected, 'rejects an incompatible context');
  return '14 statistics checks passed';
})();
