#!/usr/bin/env python3
"""Generate favicon.ico and PNG sizes from favicon.svg design."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
COLOR = "#000DC3"
SIZES = (16, 32, 48, 120, 180)


def rounded_square(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = max(2, round(size * 8 / 32))
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=COLOR)
    return img


def main() -> None:
    icons = {s: rounded_square(s) for s in SIZES}
    icons[32].save(ROOT / "favicon-32x32.png", format="PNG")
    icons[16].save(ROOT / "favicon-16x16.png", format="PNG")
    icons[120].save(ROOT / "favicon-120x120.png", format="PNG")
    icons[180].save(ROOT / "apple-touch-icon.png", format="PNG")
    icons[16].save(
        ROOT / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[icons[32].convert("RGBA"), icons[48].convert("RGBA")],
    )
    print("generated favicon.ico, png sizes, apple-touch-icon.png")


if __name__ == "__main__":
    main()
