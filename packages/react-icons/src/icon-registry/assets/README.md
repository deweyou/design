# Icon registry assets

`eye.svg` is a local Deweyou-maintained fork of the `browse.svg` glyph from
`tdesign-icons-svg`.

The local copy exists because the upstream SVG uses
`clip-path="url(#...)"`, and the icon generator intentionally rejects
fragment-referenced IDs until it can safely prefix and uniquify them.

Source/license: the original glyph is from `tdesign-icons-svg` under the MIT
license. Deweyou keeps this local copy reviewable beside the registry source.
