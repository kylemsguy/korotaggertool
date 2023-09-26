# korotaggertool
A tool to help with editing tags output by korotagger.

The intended use is to make it easier to adjust tags to be more accurate to the moment they're describing. 
You can seek to the timestamp that was recorded, seek around one second at a time (or by scrubbing on YouTube's player), and then save that new timestamp to the tag.

Once you're done, you can either copy out the output ready to paste into a YouTube comment (Note--not implemented: YT comment length limit), or click a button to download it as a .txt file. **The filename is loaded from the video when it's loaded for the first time**

If you paste the output of `!tags` from korotagger, the tool will also automatically load the video. Otherwise, you will need to paste the video URL into the box and click on "Load Video."

This tool may also be used for tagging streams live, but korotagger allows for collaborative tagging.

Currently only supports YouTube videos and stream VODs. YouTube livestreams seem to work too (and maybe Premieres), but I haven't done much testing.

## Try it!
Try it for yourself at <https://kylezhou.me/korotaggertool/korotaggertool.html>

## Proposed features
- [x] Convert korotagger output to YouTube comment format
- [ ] Convert YouTube comment format to korotagger output (allowing user to pass in a format string)
- [x] Implement tag editor with video embed that lets you test your modified tags
- [x] This also includes autofilling the current timestamp, as well as editing the timestamp/text
- [ ] Implement a banned words sanity check.
- [x] Ctrl/Cmd-Z and Ctrl/Cmd-Shift-Z for Undo/Redo
- [ ] Support Twitch VODs
- [ ] Support Twitch Streams

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
