# AudioGrade plugin API v2

Plugins declare `apiVersion: 2` and `permissions: ["reports.read"]` in their
manifest. The host provides the frozen `window.AudioGrade` object before plugin
scripts run. Every method below returns a Promise. Opening a plugin transfers no
report data and grants no access. Plugins render their own initial interface.

This replaces the experimental v1 pushed context event. Library Statistics 1.1.0
requires the updated AudioGrade preview. API v1 packages are not executed by the
v2 host; install the current catalog version. Neither preview is an App Store release.

## Discovery and evolution

```js
const info = await AudioGrade.getInfo();
// {apiVersion: 2, language: "es", appearance: "dark"}
const capabilities = await AudioGrade.getCapabilities();
// {apiVersion: 2, methods: [...], reportFields: [...],
//  limits: {selection: 1000, pageSize: 100, responseBytes: 16777216}}
```

Methods currently advertised: `host.getInfo`, `host.getCapabilities`,
`reports.requestAccess`, `reports.query`. These are domain data operations, not
native platform API access. There is no generic execution, filesystem, network,
playback, analysis, or report-writing method.

New optional methods and fields may be added within v2. Check capabilities before
using them and tolerate additional response properties. Existing method meanings,
field types and consent boundaries remain stable; breaking changes require a new
API major version. Unknown methods and unsupported versions fail explicitly.

A payload-free `audiograde:environmentChanged` event signals language or appearance
changes. Call `getInfo()` again; it does not carry or refresh report data.

## Request authorization

Ask from a clear user action in the plugin, for example a Choose Reports button:

```js
const fields = ['report.title', 'track.title', 'track.integratedLufs'];
const grant = await AudioGrade.reports.requestAccess({fields});
// {grantID: "opaque-session-token", reportCount: 3, fields: [...]}
```

AudioGrade shows a native panel naming the requested fields. The user selects
completed analysis reports and explicitly allows access, or cancels. A successful
request returns only a session-local grant and a selection count; it does not read
report payloads. Plugins cannot select reports, provide report IDs, or approve their
own requests. The selection is limited to 1,000 reports. No grant is persisted.

A request covered by the current grant returns that grant. A request for additional
fields needs a new native confirmation and selection. Cancelling it leaves the
previous grant intact. Only one authorization prompt can be pending.

Supported fields:

- `report.title`, `report.artist`, `report.album`
- `track.title`, `track.format`, `track.durationSeconds`, `track.sampleRate`
- `track.bitsPerSample`, `track.channels`
- `track.dynamicRange`, `track.integratedLufs`, `track.truePeakDbTp`

Request only fields your plugin uses. File paths, bookmarks, raw audio, artwork,
credentials, diagnostics and internal database IDs are never available.

## Query authorized data

```js
let offset = 0;
const reports = [];
do {
  const page = await AudioGrade.reports.query({
    grantID: grant.grantID, fields, offset, limit: 100
  });
  // {reports: [{title: "Example", tracks: [{title: "Track", integratedLufs: -16}]}],
  //  total: 3, nextOffset: null}
  reports.push(...page.reports);
  offset = page.nextOffset;
} while (offset !== null);
```

`fields` is mandatory and must be a nonempty subset of the granted fields.
`offset` defaults to 0, `limit` to 100 (valid range 1–100). Selection order is fixed
within a grant. A new grant invalidates the old token, including in-flight replies.
Queries read the current saved payloads for that page, not a frozen library-wide
snapshot. A deleted/unavailable report makes its page fail, never broadens access.

Only requested fields are returned. Reports contain `tracks` only when track
fields were requested. Optional or non-finite values are omitted; zero remains a
valid measurement. Technical numbers are positive except duration (zero allowed).
There is at most one data query in flight per session, so request pages sequentially.
Responses are limited to 16 MiB; request smaller pages or fewer fields if necessary.

## Cancellation and revocation

Cancel rejects the pending authorization with `USER_CANCELLED`. Render a useful
initial state and allow another deliberate request. Do not repeatedly prompt.

The native Stop Sharing action invalidates grants and pending work, destroys the
WebKit document and starts a new plugin instance with no report data. Closing,
disabling, removing, blocking or catalog revocation ends the session too. An
in-flight response is checked again after reading and is not delivered after
revocation. Tokens cannot be reused across instances or plugins. A plugin cannot
persist its reports in the nonpersistent host or transmit them over the network.

## Errors and transport limits

Promises reject with `error.code`: `INVALID_REQUEST`, `UNSUPPORTED_VERSION`,
`METHOD_NOT_FOUND`, `INVALID_FIELDS`, `ACCESS_DENIED`, `ACCESS_REVOKED`,
`USER_CANCELLED`, `BUSY`, `DATA_UNAVAILABLE`, or `RESPONSE_TOO_LARGE`.
Localize user-facing recovery messages; internal exceptions and paths are not
exposed. Native transport requests are limited to 8 KiB and 16 in-flight calls.
Only the package's main document may call the bridge. Native dialogs, child
frames, popups, network requests and executable native code are not plugin APIs.
