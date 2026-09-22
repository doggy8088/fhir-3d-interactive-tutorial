#!/usr/bin/env bash
set -eu

usage() {
  printf 'Usage: %s [site-dir] [html-path]\n' "$0"
  printf 'Checks one static HTML page, local references, metadata, JSON-LD, and image declarations.\n'
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

site_dir=${1:-.}
html_path=${2:-index.html}

exec python3 - "$site_dir" "$html_path" <<'PY'
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.meta = {}
        self.links = []
        self.references = []
        self.images = []
        self.jsonld = []
        self.title = ""
        self.html_lang = ""
        self._title_depth = 0
        self._title_buffer = []
        self._jsonld_depth = 0
        self._jsonld_buffer = []

    def handle_starttag(self, tag, attrs):
        attrs = {key.lower(): value or "" for key, value in attrs}
        tag = tag.lower()
        if tag == "html":
            self.html_lang = attrs.get("lang", "").strip()
        elif tag == "title":
            self._title_depth = 1
            self._title_buffer = []
        elif tag == "meta":
            key = (attrs.get("name") or attrs.get("property") or "").lower()
            if key:
                self.meta.setdefault(key, []).append(attrs.get("content", ""))
        elif tag == "link":
            rel = {part.lower() for part in attrs.get("rel", "").split()}
            self.links.append((rel, attrs))
        elif tag == "img":
            self.images.append(attrs)

        for attr in ("href", "src"):
            if attr in attrs:
                self.references.append(attrs[attr])
        if "srcset" in attrs:
            self.references.extend(
                candidate.strip().split()[0]
                for candidate in attrs["srcset"].split(",")
                if candidate.strip()
            )

        if tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self._jsonld_depth = 1
            self._jsonld_buffer = []

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_data(self, data):
        if self._title_depth:
            self._title_buffer.append(data)
        if self._jsonld_depth:
            self._jsonld_buffer.append(data)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "title" and self._title_depth:
            self.title = "".join(self._title_buffer).strip()
            self._title_depth = 0
            self._title_buffer = []
        elif tag == "script" and self._jsonld_depth:
            self.jsonld.append("".join(self._jsonld_buffer).strip())
            self._jsonld_depth = 0
            self._jsonld_buffer = []


def fail(message):
    failures.append(message)
    print(f"FAIL: {message}")


def ok(message):
    print(f"PASS: {message}")


def is_external(value):
    parsed = urlparse(value)
    return (
        parsed.scheme.lower()
        in {"http", "https", "mailto", "tel", "data", "javascript", "blob", "about"}
        or value.startswith("//")
        or value.startswith("#")
    )


def local_target(value):
    parsed = urlparse(value)
    path = unquote(parsed.path)
    if not path:
        return page
    if path.startswith("/"):
        return root / path.lstrip("/")
    return page.parent / path


def absolute_http(value):
    parsed = urlparse(value.strip())
    return parsed.scheme.lower() in {"http", "https"} and bool(parsed.netloc)


if len(sys.argv) != 3:
    print("Usage: check-static-site.sh [site-dir] [html-path]", file=sys.stderr)
    sys.exit(2)

root = Path(sys.argv[1]).expanduser().resolve()
page = (root / sys.argv[2]).resolve()
failures = []

if not root.is_dir():
    print(f"FAIL: site directory does not exist: {root}")
    sys.exit(1)
if not page.is_file():
    print(f"FAIL: HTML page does not exist: {page}")
    sys.exit(1)
if root not in page.parents:
    print("FAIL: HTML page must be inside site directory")
    sys.exit(1)

try:
    html_text = page.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(html_text)
    parser.close()
except (OSError, UnicodeError) as exc:
    print(f"FAIL: cannot read HTML page: {exc}")
    sys.exit(1)

if parser.title:
    ok("title element present")
else:
    fail("title element missing or empty")

if parser.meta.get("viewport"):
    ok("viewport metadata present")
else:
    fail("viewport metadata missing")

if parser.html_lang:
    ok("html lang attribute present")
else:
    fail("html lang attribute missing")

if parser.meta.get("description"):
    ok("meta description present")
else:
    fail("meta description missing")

canonical_values = [
    attrs.get("href", "").strip()
    for rel, attrs in parser.links
    if "canonical" in rel
]
if len(canonical_values) == 1 and absolute_http(canonical_values[0]):
    ok("one absolute canonical URL present")
else:
    fail("expected exactly one absolute HTTP(S) canonical URL")

required_meta = {
    "og:title": "og:title",
    "og:description": "og:description",
    "og:url": "og:url",
    "og:image": "og:image",
    "og:image:type": "og:image:type",
    "og:image:width": "og:image:width",
    "og:image:height": "og:image:height",
    "og:image:alt": "og:image:alt",
    "twitter:card": "twitter:card",
    "twitter:image": "twitter:image",
}
for key, label in required_meta.items():
    values = parser.meta.get(key, [])
    if values and values[0].strip():
        ok(f"{label} present")
    else:
        fail(f"{label} missing")

for key in ("og:image", "og:url", "twitter:image"):
    values = parser.meta.get(key, [])
    if values and absolute_http(values[0]):
        ok(f"{key} is absolute HTTP(S)")
    else:
        fail(f"{key} must be an absolute HTTP(S) URL")

for key in ("og:image:width", "og:image:height"):
    values = parser.meta.get(key, [])
    if values and values[0].strip().isdigit() and int(values[0]) > 0:
        ok(f"{key} declares a positive pixel value")
    else:
        fail(f"{key} must declare a positive integer")

for wanted, label in (
    ({"icon"}, "favicon"),
    ({"apple-touch-icon"}, "Apple touch icon"),
    ({"manifest"}, "web manifest"),
):
    if any(wanted.issubset(rel) for rel, _ in parser.links):
        ok(f"{label} link present")
    else:
        fail(f"{label} link missing")

for image in parser.images:
    if "alt" in image:
        ok("img alt attribute present")
    else:
        fail("img is missing an alt attribute")

if not parser.jsonld:
    fail("application/ld+json script missing")
else:
    for index, value in enumerate(parser.jsonld, 1):
        try:
            json.loads(value)
            ok(f"JSON-LD block {index} is valid JSON")
        except json.JSONDecodeError as exc:
            fail(f"JSON-LD block {index} is invalid: {exc.msg}")

seen = set()
for reference in parser.references:
    reference = reference.strip()
    if not reference or reference in seen or is_external(reference):
        continue
    seen.add(reference)
    target = local_target(reference).resolve()
    try:
        target.relative_to(root)
    except ValueError:
        fail(f"local reference escapes site directory: {reference}")
        continue
    if target.exists():
        ok(f"local resource exists: {reference}")
    else:
        fail(f"missing local resource: {reference}")

if failures:
    print(f"\n{len(failures)} static-site check(s) failed.")
    sys.exit(1)
print("\nStatic-site checks passed.")
PY
