# korotaggertool
A tool to help with editing tags output by korotagger

## Proposed features
- [x] Convert korotagger output to YouTube comment format
- [ ] Convert YouTube comment format to korotagger output (allowing user to pass in a format string)
- [x] Implement tag editor with video embed that lets you test your modified tags
- [x] This also includes autofilling the current timestamp, as well as editing the timestamp/text
- [ ] Implement a banned words sanity check.

## TODO list
- [x] re-sort list when times are changed
- [x] add delete button
- [x] add button to sync tag with current time
- [x] add undo button (implement naively--store a stack of past JSON's)
- [x] add redo button
- [ ] figure out how best to do auto-save (add a timed job that autosaves to local storage)
- [x] allow creating new tag at current time

Try it for yourself at https://kylezhou.me/korotaggertool/korotaggertool.html
