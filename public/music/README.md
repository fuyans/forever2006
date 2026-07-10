# Background music

Drop a file named `background.mp3` into this folder (`public/music/`) and it
will play when visitors click the music button (bottom-right).

## Important: licensing

You must use music you **own or are licensed to use**. Do not ship a copyrighted
pop track you don't have rights to — even on a private site, it's a copyright
infringement. Good options:

- A track you composed / had composed for the reunion.
- Royalty-free music from a service that permits this use (e.g. purchased from
  Epidemic Sound, Artlist, or similar — check the license terms).
- A school performance recording you have the rights to.

## Format

- MP3 works everywhere and is small. AAC (.m4a) also works.
- Aim for a file under ~5 MB. Use a tool like `ffmpeg` to compress if needed:
  ```
  ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k background.mp3
  ```

## To change the filename or add multiple tracks

Edit `app/components/MusicPlayer.vue` — the `<source src=...>` line.
