/* SPDX-License-Identifier: MIT */
(() => {
  'use strict';
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const group = (tracks, key) => {
    const counts = new Map();
    for (const track of tracks) {
      const raw = track[key];
      const value = key === 'format' ? (typeof raw === 'string' && raw.trim() ? raw.trim().toUpperCase() : null)
        : (finite(raw) && raw > 0 ? String(raw) : null);
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    return Array.from(counts, ([value, count]) => ({value, count}))
      .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)));
  };
  function summarize(context) {
    if (!context || context.apiVersion !== 1 || !Array.isArray(context.reports)) throw new Error('Unsupported context');
    const tracks = context.reports.flatMap(report => (Array.isArray(report.tracks) ? report.tracks : []).map(track => ({
      ...track, reportTitle: report.title || '', artist: report.artist || '', album: report.album || ''
    })));
    const durations = tracks.filter(t => finite(t.durationSeconds) && t.durationSeconds >= 0);
    return {
      reportCount: context.reports.length, trackCount: tracks.length,
      knownDurationSeconds: durations.reduce((sum, t) => sum + t.durationSeconds, 0),
      knownDurationCount: durations.length, unknownDurationCount: tracks.length - durations.length,
      formats: group(tracks, 'format'), sampleRates: group(tracks, 'sampleRate'),
      bitDepths: group(tracks, 'bitsPerSample'), tracks
    };
  }
  function sortTracks(tracks, field, descending = false) {
    return [...tracks].sort((a, b) => {
      const left = a[field], right = b[field];
      const missing = value => value == null || (typeof value === 'number' && !finite(value));
      if (missing(left) || missing(right)) return Number(missing(left)) - Number(missing(right));
      const result = typeof left === 'number' && typeof right === 'number'
        ? left - right : String(left).localeCompare(String(right));
      return descending ? -result : result;
    });
  }
  globalThis.AudioGradeStatistics = Object.freeze({summarize, sortTracks});
})();
