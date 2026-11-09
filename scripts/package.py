#!/usr/bin/env python3
"""Build deterministic external plugin assets. Nothing is copied into AudioGrade."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
entries = []
catalog_path = ROOT / "catalog.json"
revocations = json.loads(catalog_path.read_text()).get("revokedVersions", {}) if catalog_path.exists() else {}
output = ROOT / "dist"
output.mkdir(exist_ok=True)
for folder in sorted((ROOT / "plugins").iterdir()):
    manifest = json.loads((folder / "manifest.json").read_text())
    revoked = revocations.get(manifest["id"], [])
    if "*" in revoked or manifest["version"] in revoked:
        continue
    files = {p.relative_to(folder).as_posix(): p.read_text() for p in sorted(folder.rglob("*"))
             if p.is_file() and p.name != "manifest.json" and p.suffix in (".html", ".js", ".css", ".json", ".txt")}
    package = json.dumps({"manifest": manifest, "files": files}, sort_keys=True,
                         ensure_ascii=False, separators=(",", ":")).encode()
    assert len(package) <= 5 * 1024 * 1024
    filename = f"{manifest['id']}-{manifest['version']}.agplugin"
    (output / filename).write_bytes(package)
    entries.append({"manifest": manifest,
                    "downloadURL": f"https://github.com/gpiano/AudioGradePlugins/releases/download/{manifest['id']}-v{manifest['version']}/{filename}",
                    "sha256": hashlib.sha256(package).hexdigest()})
catalog = {"schemaVersion": 1, "plugins": entries, "revokedVersions": revocations}
(ROOT / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
for entry in entries:
    print(entry["manifest"]["id"], entry["manifest"]["version"], entry["sha256"])
