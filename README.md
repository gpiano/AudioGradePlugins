# AudioGrade Plugins

External, MIT-licensed plugins for AudioGrade. Library Statistics 1.0.0 is
published as an immutable GitHub prerelease with its reviewed catalog and
SHA-256 digest. It is intended for the AudioGrade plugins preview branch.
The released App Store app does not yet include the plugin manager.

[Download and source release](https://github.com/gpiano/AudioGradePlugins/releases/tag/library-statistics-v1.0.0)

Website integration, associated-domain provisioning and App Review validation
remain prerequisites for an App Store release.

## Library Statistics

Shows report and track counts, known duration, distributions of formats, sample
rates and bit depths, and a sortable track measurement table. It works on the
reports explicitly shared by the user in the current session. Repeated recordings
are counted per report; unavailable values remain unavailable. Loudness is never
averaged or interpreted as a quality score.

## Develop and test

No package manager or runtime download is required by end users. The plugin runs
in AudioGrade's isolated WebKit view. On a developer Mac with Xcode tools:

```sh
python3 scripts/localize.py
swift scripts/test.swift
python3 scripts/package.py
```

The package command produces a deterministic `dist/*.agplugin` JSON asset and
`catalog.json`, including its SHA-256 digest. The asset contains UTF-8 web files,
not native binaries or an archive. HTML must load external script files; inline
scripts, remote resources, frames, workers, network access and file access are
not part of API v1. Use `textContent` to display user-provided strings.

## Data API v1

```js
window.addEventListener('audiograde:context', ({detail: context}) => {
  // context.apiVersion, context.language, context.appearance, context.reports
});
```

The host sends a fresh read-only JSON snapshot after native selection and consent.
Reports contain `title`, optional `artist` and `album`, and `tracks`. Tracks contain
`title`, optional `format`, `durationSeconds`, `sampleRate`, `bitsPerSample`,
`channels`, `dynamicRange`, `integratedLufs` and `truePeakDbTp`. Missing or non-finite
measurements are omitted. Zero is a valid measurement. No paths, bookmarks, raw
audio, artwork, credentials, engine internals or native platform APIs are exposed.
Locale and appearance changes deliver the same granted reports with updated context.

Closing the view, stopping sharing, disabling, removing, blocking the author or
revoking the plugin destroys the session. The plugin cannot persist its snapshot.

## Publishing and moderation

Contributors submit pull requests. Maintainers review the source, dependency-free
package, declared permissions, nine translations, age appropriateness, license,
privacy and support metadata, and test results before adding a catalog entry.
Only 4+ utilities are accepted in this first catalog; there are no accounts,
chat, user-generated content publishing, payments or externally loaded content.

Publish a draft GitHub release named `library-statistics-v1.0.0`, upload the exact
generated asset, enable immutable releases, then publish the release. Publish the
catalog only after that asset is reachable. Never replace an existing package
under the same version. Updates need a new version, review and explicit installation.

Users can report a plugin from the manager via the issue form and block its author
locally. Maintainers must triage reports and remove objectionable submissions.
To revoke a version, remove it from `plugins` and add its version (or `"*"`) under
`revokedVersions[pluginID]`. The manager honors the latest successfully fetched
catalog. Offline sessions use the last verified catalog; revocation is effective
once an updated catalog is retrieved. Do not advertise immediate offline revocation.

`website/` contains deployment inputs for the AudioGrade website. Universal links
require both the association file on audiograde.app and the app's associated-domain
entitlement. GitHub repository URLs alone are not universal links into AudioGrade.

Source is MIT licensed. Public availability does not establish Apple approval.
Review requirements and deployment prerequisites are tracked in AudioGrade's
`docs/plugins-architecture.md`.
