# korotaggertool
A tool to help with editing tags output by korotagger

## Proposed features
- [x] Convert korotagger output to YouTube comment format
- [ ] Convert YouTube comment format to korotagger output (allowing user to pass in a format string)
- [ ] Implement tag editor with video embed that lets you test your modified tags
- [ ] This also includes autofilling the current timestamp, as well as editing the timestamp/text
- [ ] Implement a banned words sanity check.

## TODO list
- [ ] re-sort list when times are changed
- [ ] add delete button
- [ ] add button to sync tag with current time
- [ ] add undo button (implement naively--store a stack of past JSON's)
- [ ] add redo button
- [ ] figure out how best to do auto-save (maybe when timestamps are consistent do an auto-save?)
- [ ] allow creating new tag at current time

Try it for yourself at https://kylezhou.me/korotaggertool/korotaggertool.html
