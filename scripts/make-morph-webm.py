#!/usr/bin/env python3
"""Generate a seamless square<->circle morph as a transparent WebM (VP9 + alpha).

Draws a rounded rectangle whose corner radius eases from 0 (square) to
half-side (circle) and back, loop-perfect. Frames are supersampled for
smooth anti-aliased edges, then encoded to VP9 with an alpha channel.
"""
import math
import os
import shutil
import subprocess
import tempfile

from PIL import Image, ImageDraw

SIZE = 512          # output resolution (px, square)
SS = 4              # supersampling factor for anti-aliasing
FPS = 60
DURATION = 2.0      # seconds per loop
BOX = 0.60          # shape side as a fraction of the canvas
FILL = (99, 102, 241, 255)   # indigo, fully opaque shape on transparent bg

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "images", "square-circle.webm")
OUT_WEBP = os.path.join(os.path.dirname(__file__), "..", "assets", "images", "square-circle.webp")


def draw_frame(t: float) -> Image.Image:
    """t in [0,1). Returns one RGBA frame."""
    big = SIZE * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    side = BOX * big
    x0 = (big - side) / 2
    y0 = (big - side) / 2
    x1 = x0 + side
    y1 = y0 + side

    # 0 -> 1 -> 0 over the loop; eased so square and circle both "hold" briefly.
    p = (1 - math.cos(2 * math.pi * t)) / 2
    p = p * p * (3 - 2 * p)          # smoothstep for a softer morph
    radius = p * (side / 2)

    d.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=FILL)
    return img.resize((SIZE, SIZE), Image.LANCZOS)


def main():
    n = int(FPS * DURATION)
    tmp = tempfile.mkdtemp(prefix="morph-")
    try:
        frames = []
        for i in range(n):
            fr = draw_frame(i / n)
            frames.append(fr)
            fr.save(os.path.join(tmp, f"f{i:04d}.png"))

        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        subprocess.run([
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", os.path.join(tmp, "f%04d.png"),
            "-c:v", "libvpx",         # VP8 = reliable alpha in ffmpeg
            "-pix_fmt", "yuva420p",   # 'a' = alpha channel preserved
            "-auto-alt-ref", "0",     # required for alpha with libvpx
            "-crf", "18", "-b:v", "1M",
            OUT,
        ], check=True)
        print("wrote", os.path.normpath(OUT))

        # Animated WebP, lossless to keep alpha edges clean, infinite loop.
        frames[0].save(
            OUT_WEBP,
            save_all=True,
            append_images=frames[1:],
            duration=int(1000 / FPS),
            loop=0,
            disposal=2,             # clear each frame -> no ghosting on alpha
            lossless=True,
            method=6,               # slowest/best compression
        )
        print("wrote", os.path.normpath(OUT_WEBP))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
