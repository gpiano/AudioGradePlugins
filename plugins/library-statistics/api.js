/* SPDX-License-Identifier: MIT */
(() => {
  'use strict';
  const fields = Object.freeze(['report.title', 'report.artist', 'track.title', 'track.format',
    'track.durationSeconds', 'track.sampleRate', 'track.bitsPerSample',
    'track.dynamicRange', 'track.integratedLufs', 'track.truePeakDbTp']);
  async function load(api) {
    const capabilities = await api.getCapabilities();
    if (capabilities.apiVersion !== 2 || !['reports.requestAccess', 'reports.query'].every(name => capabilities.methods.includes(name))
      || !fields.every(name => capabilities.reportFields.includes(name))) throw new Error('UNSUPPORTED_API');
    const grant = await api.reports.requestAccess({fields: [...fields]});
    const reports = [];
    let offset = 0;
    do {
      const page = await api.reports.query({grantID: grant.grantID, fields: [...fields], offset,
        limit: Math.min(100, capabilities.limits.pageSize)});
      reports.push(...page.reports);
      if (page.nextOffset !== null && (!Number.isInteger(page.nextOffset) || page.nextOffset <= offset)) {
        throw new Error('INVALID_PAGE');
      }
      offset = page.nextOffset;
    } while (offset !== null);
    return {...await api.getInfo(), reports};
  }
  globalThis.AudioGradeStatisticsData = Object.freeze({fields, load});
})();
