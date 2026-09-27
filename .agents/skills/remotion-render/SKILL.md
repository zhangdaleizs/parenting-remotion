---
name: remotion-render
description: Best practices for rendering videos
metadata:
  tags: remotion, render
---

## General rendering strategy

Render a video using:

```
npx remotion render
```

Full list of options: https://www.remotion.dev/docs/cli/render.md

Render a still using:

```
npx remotion still
```

Full list of options: https://www.remotion.dev/docs/cli/still.md

## Transparent videos

See [Transparent videos](./transparent-videos.md) for rendering out a video with transparency.

## Flickering / duplicated frames in the output

Symptom: the final video flickers at scattered single frames, but the composition is deterministic (fresh `remotion still` renders are smooth and adjacent frames differ only slightly).

Cause: with parallel rendering (default `--concurrency=2`), the frame server can occasionally pass a stale screenshot to the encoder, so the MP4 gets random single-frame errors whose content is duplicated from another point in time. Flash positions change between renders.

Fix: render with `--concurrency=1`. If that is too slow, render an image sequence first, then encode it with your own ffmpeg command.

Verify before delivery: decode the MP4 and diff adjacent frames. A single-frame flash looks like frame N differs strongly from both N-1 and N+1 while N-1 ≈ N+1.
