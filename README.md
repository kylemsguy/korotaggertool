# korotaggertool
A tool to help with editing tags output by korotagger

## Proposed features
- [x] Convert korotagger output to YouTube comment format
- [ ] Convert YouTube comment format to korotagger output (allowing user to pass in a format string)
- [x] Implement tag editor with video embed that lets you test your modified tags
- [x] This also includes autofilling the current timestamp, as well as editing the timestamp/text
- [ ] Implement a banned words sanity check.
- [x] Ctrl/Cmd-Z and Ctrl/Cmd-Shift-Z for Undo/Redo

## TODO list
- [x] re-sort list when times are changed
- [x] add delete button
- [x] add button to sync tag with current time
- [x] add undo button (implement naively--store a stack of past JSON's)
- [x] add redo button
- [x] figure out how best to do auto-save (add a timed job that autosaves to local storage)
- [x] allow creating new tag at current time
- [x] Allow importing YT comment format as well
- [x] Implement a download button
- [ ] Allow disabling autosave (and changing autosave delay)
- [ ] Add a clear button

Try it for yourself at https://kylezhou.me/korotaggertool/korotaggertool.html
