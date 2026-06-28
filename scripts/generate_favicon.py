#!/usr/bin/env python3
"""
Генерация favicon для BoSore (Next.js App Router).

Стиль: тёмный фон + неон cyan/magenta, как на главной странице.
Файлы попадают в src/app/ — Next.js подхватит их автоматически на Vercel.

Запуск:
  pip install -r scripts/requirements-favicon.txt
  python scripts/generate_favicon.py

Или:
  npm run favicon
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "src" / "app"

# Палитра BoSore (globals.css)
BG = (10, 10, 20)
NEON_CYAN = (0, 255, 245)
NEON_MAGENTA = (255, 45, 149)


def _lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def draw_icon(size: int) -> Image.Image:
    """Рисует иконку: неоновая «книга» на тёмной плашке."""
    scale = size / 512.0
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # Мягкое свечение
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    pad = int(44 * scale)
    gd.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=int(96 * scale),
        fill=(*NEON_CYAN, 28),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=max(2, int(14 * scale))))
    img = Image.alpha_composite(img, glow)

    draw = ImageDraw.Draw(img)
    pad = int(52 * scale)
    radius = int(92 * scale)
    border = max(1, int(2.5 * scale))

    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=radius,
        fill=(*BG, 255),
        outline=(*NEON_CYAN, 70),
        width=border,
    )

    cx = size // 2
    top = int(132 * scale)
    bottom = int(368 * scale)
    spine = max(2, int(10 * scale))
    spread = int(108 * scale)

    # Левая страница (cyan)
    left_page = [
        (cx - spread, top + int(8 * scale)),
        (cx - spine // 2 - 1, top + int(28 * scale)),
        (cx - spine // 2 - 1, bottom - int(12 * scale)),
        (cx - spread - int(18 * scale), bottom - int(28 * scale)),
    ]
    draw.polygon(left_page, fill=(*NEON_CYAN, 215))

    # Правая страница (magenta)
    right_page = [
        (cx + spine // 2 + 1, top + int(28 * scale)),
        (cx + spread, top + int(8 * scale)),
        (cx + spread + int(18 * scale), bottom - int(28 * scale)),
        (cx + spine // 2 + 1, bottom - int(12 * scale)),
    ]
    draw.polygon(right_page, fill=(*NEON_MAGENTA, 195))

    # Корешок
    draw.rounded_rectangle(
        [cx - spine // 2, top + int(18 * scale), cx + spine // 2, bottom - int(18 * scale)],
        radius=max(1, spine // 4),
        fill=(238, 244, 255, 235),
    )

    # Линии текста (абстрактно)
    line_h = max(1, int(5 * scale))
    for i, alpha in enumerate((120, 90, 70)):
        y = int((228 + i * 34) * scale)
        draw.rounded_rectangle(
            [cx - int(72 * scale), y, cx - int(18 * scale), y + line_h],
            radius=line_h // 2,
            fill=(*BG, alpha),
        )
        draw.rounded_rectangle(
            [cx + int(18 * scale), y, cx + int(72 * scale), y + line_h],
            radius=line_h // 2,
            fill=(*BG, alpha),
        )

    # Акцентная линия снизу (как под заголовком на сайте)
    line_y = size - int(78 * scale)
    line_len = int(120 * scale)
    line_x = cx - line_len // 2
    line_th = max(1, int(4 * scale))
    for i in range(line_len):
        color = _lerp(NEON_CYAN, NEON_MAGENTA, i / max(1, line_len - 1))
        draw.line(
            [(line_x + i, line_y), (line_x + i, line_y + line_th)],
            fill=(*color, 255),
        )

    return img


def _save_outputs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    master = draw_icon(512)

    ico_16 = master.resize((16, 16), Image.Resampling.LANCZOS)
    ico_32 = master.resize((32, 32), Image.Resampling.LANCZOS)
    ico_48 = master.resize((48, 48), Image.Resampling.LANCZOS)

    favicon_path = OUT_DIR / "favicon.ico"
    ico_32.save(
        favicon_path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[ico_16, ico_48],
    )

    icon_path = OUT_DIR / "icon.png"
    master.resize((32, 32), Image.Resampling.LANCZOS).save(icon_path, optimize=True)

    apple_path = OUT_DIR / "apple-icon.png"
    master.resize((180, 180), Image.Resampling.LANCZOS).save(apple_path, optimize=True)

    print("BoSore favicon generated:")
    print(f"  {favicon_path.relative_to(ROOT)}")
    print(f"  {icon_path.relative_to(ROOT)}")
    print(f"  {apple_path.relative_to(ROOT)}")
    print("\nCommit these files and deploy to Vercel.")


def main() -> None:
    _save_outputs()


if __name__ == "__main__":
    main()
