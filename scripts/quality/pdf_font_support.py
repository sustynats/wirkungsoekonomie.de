"""Portable, deterministic font registration for public WÖK PDFs.

Mac-based editorial work may use the existing Arial/Andale files.  The public
build also runs on Linux, where those proprietary fonts are not available.
The resolver therefore keeps the established fonts as its first choice and
uses metrically suitable, Unicode-capable open fonts when necessary.
"""

from __future__ import annotations

from pathlib import Path

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


FONT_DIRECTORIES = (
    Path("/System/Library/Fonts/Supplemental"),
    Path("/Library/Fonts"),
    Path("/usr/share/fonts/truetype/dejavu"),
    Path("/usr/share/fonts/truetype/noto"),
    Path("/usr/share/fonts/truetype/liberation2"),
    Path("/usr/share/fonts/truetype/liberation"),
    Path("/usr/share/fonts/truetype/freefont"),
    Path("C:/Windows/Fonts"),
)

FONT_CANDIDATES = {
    "WoeKText": (
        "Arial Unicode.ttf",
        "DejaVuSans.ttf",
        "NotoSans-Regular.ttf",
        "LiberationSans-Regular.ttf",
        "FreeSans.ttf",
    ),
    "WoeKBold": (
        "Arial Bold.ttf",
        "DejaVuSans-Bold.ttf",
        "NotoSans-Bold.ttf",
        "LiberationSans-Bold.ttf",
        "FreeSansBold.ttf",
    ),
    "WoeKMono": (
        "Andale Mono.ttf",
        "DejaVuSansMono.ttf",
        "NotoSansMono-Regular.ttf",
        "LiberationMono-Regular.ttf",
        "FreeMono.ttf",
    ),
}


def resolve_font(font_name: str) -> Path:
    """Return the first available font for a named WÖK text role."""

    for candidate_name in FONT_CANDIDATES[font_name]:
        for directory in FONT_DIRECTORIES:
            candidate = directory / candidate_name
            if candidate.exists():
                return candidate
    candidates = ", ".join(FONT_CANDIDATES[font_name])
    directories = ", ".join(str(directory) for directory in FONT_DIRECTORIES)
    raise FileNotFoundError(
        f"No usable public-PDF font found for {font_name}. "
        f"Looked for {candidates} in {directories}."
    )


def register_woek_fonts() -> None:
    """Register the three public PDF fonts under stable WÖK names."""

    registered = set(pdfmetrics.getRegisteredFontNames())
    for font_name in FONT_CANDIDATES:
        if font_name not in registered:
            pdfmetrics.registerFont(TTFont(font_name, str(resolve_font(font_name))))
