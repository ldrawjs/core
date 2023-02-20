# @ldrawjs/core

## Low Level Functions

### parse

Takes `LDraw` file and return JSON version `LDrawJson`.

### collect

Takes `LDrawJson` and collect all its parts into single map `Collected`.

### convert

Takes `Collected` and return JSON `LDrawDocuments`.

### generate

Takes `LDrawDocuments` and return `Three` group.

## Open Issues

- add colors support
- add material support
- add steps support (require document/interface change)
