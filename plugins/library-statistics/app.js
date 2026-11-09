/* SPDX-License-Identifier: MIT */
(() => {
  'use strict';
  let context, summary, words, number, locale, field = 'title', descending = false, failed = false;
  const el = id => document.getElementById(id);
  const node = (tag, text, className) => {
    const result = document.createElement(tag);
    if (text != null) result.textContent = text;
    if (className) result.className = className;
    return result;
  };
  const metric = value => typeof value === 'number' && Number.isFinite(value) ? number.format(value) : '—';
  const integer = value => new Intl.NumberFormat(locale, {maximumFractionDigits: 0}).format(value);
  function duration(seconds) {
    const total = Math.round(seconds), h = Math.floor(total / 3600), m = Math.floor(total % 3600 / 60), s = total % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  function card(label, value) {
    const card = node('article', null, 'card');
    card.append(node('p', label, 'muted'), node('strong', value));
    return card;
  }
  function distribution(title, entries, format) {
    const section = node('article', null, 'distribution');
    section.append(node('h2', title));
    if (!entries.length) section.append(node('p', words.empty, 'muted'));
    for (const entry of entries) {
      const row = node('div', null, 'bar-row');
      const label = entry.value == null ? words.unknown : format(entry.value);
      const heading = node('div', null, 'bar-heading');
      heading.append(node('span', label), node('span', integer(entry.count), 'muted'));
      const meter = node('div', null, 'bar');
      const fill = node('div', null, 'fill');
      fill.style.width = `${summary.trackCount ? entry.count / summary.trackCount * 100 : 0}%`;
      meter.append(fill); row.append(heading, meter); section.append(row);
    }
    return section;
  }
  function renderTable() {
    const query = el('search').value.trim().toLocaleLowerCase(locale);
    const rows = AudioGradeStatistics.sortTracks(summary.tracks.filter(track =>
      [track.title, track.reportTitle, track.artist, track.format].some(value =>
        String(value || '').toLocaleLowerCase(locale).includes(query))), field, descending);
    el('tracks').replaceChildren();
    for (const track of rows) {
      const row = node('tr');
      const identity = node('td');
      identity.append(node('div', track.title), node('small', track.reportTitle, 'muted'));
      row.append(identity, node('td', track.format || words.unknown),
        node('td', metric(track.dynamicRange), 'numeric'), node('td', metric(track.integratedLufs), 'numeric'),
        node('td', metric(track.truePeakDbTp), 'numeric'));
      el('tracks').append(row);
    }
    el('no-matches').hidden = rows.length !== 0;
    for (const th of el('columns').children) th.setAttribute('aria-sort',
      th.dataset.field === field ? (descending ? 'descending' : 'ascending') : 'none');
  }
  function render() {
    locale = context.language === 'zh-hans' ? 'zh-Hans' : context.language === 'zh-hant' ? 'zh-Hant' : context.language;
    words = AudioGradePluginLocales[context.language] || AudioGradePluginLocales.en;
    number = new Intl.NumberFormat(locale, {minimumFractionDigits: 1, maximumFractionDigits: 1});
    document.documentElement.lang = locale;
    document.documentElement.dataset.appearance = context.appearance;
    document.title = words.title;
    el('eyebrow').textContent = words.eyebrow; el('title').textContent = words.title;
    el('subtitle').textContent = words.subtitle;
    el('load-error').textContent = words.accessError;
    el('load-error').hidden = !failed;
    el('statistics').hidden = !summary;
    el('results').hidden = !summary;
    if (!summary) return;
    el('summary').setAttribute('aria-label', words.summary);
    el('summary').replaceChildren(card(words.reports, integer(summary.reportCount)), card(words.tracks, integer(summary.trackCount)),
      card(words.duration, summary.knownDurationCount ? duration(summary.knownDurationSeconds) : '—'));
    el('distributions').replaceChildren(distribution(words.formats, summary.formats, x => x),
      distribution(words.sampleRates, summary.sampleRates, x => `${integer(Number(x))} Hz`),
      distribution(words.bitDepths, summary.bitDepths, x => `${x} bit`));
    el('tracks-title').textContent = words.measurements;
    el('search-label').textContent = words.search; el('search').placeholder = words.search;
    el('no-matches').textContent = words.empty;
    el('columns').replaceChildren();
    for (const [key, title] of [['title', words.track], ['format', words.format], ['dynamicRange', 'DR'],
      ['integratedLufs', 'LUFS-I'], ['truePeakDbTp', 'dBTP']]) {
      const th = node('th'); th.scope = 'col'; th.dataset.field = key;
      const button = node('button', title);
      button.addEventListener('click', () => { descending = field === key ? !descending : false; field = key; renderTable(); });
      th.append(button); el('columns').append(th);
    }
    el('note').textContent = words.note + (summary.unknownDurationCount ? ` ${words.missingDuration}: ${integer(summary.unknownDurationCount)}.` : '');
    renderTable();
  }
  el('search').addEventListener('input', () => { if (summary) renderTable(); });
  async function updateEnvironment() {
    context = {...context, ...await AudioGrade.getInfo()};
    render();
  }
  async function loadReports() {
    try {
      context = await AudioGradeStatisticsData.load(AudioGrade);
      summary = AudioGradeStatistics.summarize(context);
      render();
    } catch (error) {
      summary = undefined;
      failed = !['USER_CANCELLED', 'ACCESS_REVOKED'].includes(error.code);
      render();
    }
  }
  window.addEventListener('audiograde:environmentChanged', () => { updateEnvironment().catch(() => {}); });
  updateEnvironment().then(loadReports).catch(() => {
    context = {language: 'en', appearance: 'dark'};
    failed = true; render();
  });
})();
