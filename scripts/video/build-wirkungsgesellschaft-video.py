#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
AUDIO_SOURCE = Path("/Users/hagen/Downloads/Wirkungsgesellschaft-esv2-89p-bg-10p-music-10p.wav")
SCRIPT_SOURCE = Path("/Users/hagen/.codex/attachments/c6d1b141-1df1-458d-a229-feb2c928bdb9/pasted-text.txt")
OUT_DIR = ROOT / "assets" / "video"
WORK_DIR = ROOT / "tmp" / "wirkungsgesellschaft-video"
VIDEO_TARGET = OUT_DIR / "wirkungsgesellschaft-erklaervideo.mp4"
POSTER_TARGET = OUT_DIR / "wirkungsgesellschaft-erklaervideo-poster.png"
STORYBOARD_TARGET = WORK_DIR / "storyboard.json"

WIDTH = 1280
HEIGHT = 720
FPS = 24

FONT_REGULAR = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
FONT_BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")

NAVY = "#0b1020"
INK = "#1b2334"
MUTED = "#566170"
GREEN = "#2f7d5c"
GREEN_DARK = "#1f5e43"
GOLD = "#c4a052"
CREAM = "#f7f4ec"
PAPER = "#fffdf7"
SOFT = "#e8f1e9"
LINE = "#d9deca"
RED = "#8b3d37"
BLUE = "#315f82"
CYAN = "#2b8ca3"


@dataclass(frozen=True)
class Scene:
    start: float
    end: float
    kicker: str
    title: str
    subtitle: str
    bullets: tuple[str, ...]
    visual: str


SCENES = [
    Scene(
        0,
        20,
        "Einstieg",
        "Wir wissen so viel wie nie",
        "Daten, Forschung und KI machen Probleme sichtbar. Aber Sichtbarkeit allein verändert noch kein System.",
        ("Emissionen", "Lieferketten", "Demokratie"),
        "data_world",
    ),
    Scene(
        20,
        50,
        "Übergang",
        "Von Wissen zu Wirkung",
        "Die Wissensgesellschaft sammelt Erkenntnis. Die Wirkungsgesellschaft macht Erkenntnis wirksam.",
        ("Was wissen wir?", "Was bewirkt es?", "Wie fließt es zurück?"),
        "bridge",
    ),
    Scene(
        50,
        85,
        "Das einfache Bild",
        "Thermometer und Thermostat",
        "Berichte zeigen Zustände. Rückkopplung verändert Preise, Steuern, Kapital und Entscheidungen.",
        ("Messen", "Bewerten", "Zurückkoppeln", "Verändern"),
        "thermostat",
    ),
    Scene(
        85,
        125,
        "Beispiel Apfel",
        "Der Preis soll weniger lügen",
        "Zwei Äpfel können gleich aussehen und trotzdem sehr unterschiedliche Wirkpfade haben.",
        ("Wasser", "Boden", "Transport", "faire Arbeit", "Biodiversität"),
        "apple",
    ),
    Scene(
        125,
        165,
        "Wirkung",
        "Was verändert sich wirklich?",
        "Wirkung ist keine gute Absicht. Wirkung ist tatsächliche Zustandsveränderung.",
        ("Output ist Aktivität", "Wirkung ist Veränderung", "Reichweite ist nicht Wirkung"),
        "impact",
    ),
    Scene(
        165,
        205,
        "Historischer Bogen",
        "Vom 5. zum 6. Kondratieff",
        "Aus Daten, Digitalisierung und Wissen wird die Frage nach Nachhaltigkeit, Resilienz, Gesundheit und Wirkung.",
        ("5. Kondratieff: Was wissen wir?", "6. Kondratieff: Was bewirkt es?"),
        "kondratieff",
    ),
    Scene(
        205,
        245,
        "Maßstab",
        "Kapital bleibt Werkzeug",
        "Der Kompass verschiebt sich: von Kapital zu Wirkung, von Reporting zu Rückkopplung, von Output zu positiver Netto-Wirkung.",
        ("Kapital → Wirkung", "Reporting → Rückkopplung", "Output → positive Netto-Wirkung"),
        "shift",
    ),
    Scene(
        245,
        285,
        "Nichtkompensation",
        "Kein Schönrechnen",
        "Schwere negative Wirkungen dürfen nicht durch schöne Teilwirkungen verdeckt werden.",
        ("Kinderarbeit bleibt Grenze", "vergiftete Flüsse bleiben Grenze", "Verdrängung bleibt Grenze"),
        "noncomp",
    ),
    Scene(
        285,
        325,
        "Schutzlinie",
        "Keine Planwirtschaft. Kein Social Credit.",
        "Bewertet werden Wirkpfade von Produkten, Regeln, Programmen und Kapitalflüssen - nicht Menschen als Personen.",
        ("Transparenz", "Grundrechtsschutz", "Einspruch", "demokratische Kontrolle"),
        "not_social_credit",
    ),
    Scene(
        325,
        365,
        "Schluss",
        "Wissen wird Wirkung",
        "Wissen verändert erst dann Welt, wenn es in Entscheidungen zurückwirkt.",
        ("Berichte verändern Preise", "Kennzahlen lenken Kapital", "Probleme verändern Anreize"),
        "final",
    ),
    Scene(
        365,
        380,
        "Weiterlesen",
        "Journal. Dossier. Glossar.",
        "Mehr auf wirkungsoekonomie.de: Von der Wissensgesellschaft zur Wirkungsgesellschaft.",
        ("Was wird wirklich besser?",),
        "cta",
    ),
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


def audio_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(json.loads(result.stdout)["format"]["duration"])


def scaled_scenes(total_duration: float) -> list[Scene]:
    original_end = SCENES[-1].end
    scale = total_duration / original_end
    return [
        Scene(
            start=scene.start * scale,
            end=scene.end * scale,
            kicker=scene.kicker,
            title=scene.title,
            subtitle=scene.subtitle,
            bullets=scene.bullets,
            visual=scene.visual,
        )
        for scene in SCENES
    ]


def text_width(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    return int(draw.textbbox((0, 0), text, font=fnt)[2])


def wrap_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        line = ""
        for word in words:
            candidate = f"{line} {word}".strip()
            if draw.textbbox((0, 0), candidate, font=fnt)[2] <= max_width:
                line = candidate
            else:
                if line:
                    lines.append(line)
                line = word
        if line:
            lines.append(line)
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill: str,
    max_width: int,
    line_gap: int = 8,
) -> int:
    x, y = xy
    for line in wrap_text(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + line_gap
    return y


def rounded_rect(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str, outline: str | None = None, width: int = 2, radius: int = 18) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_arrow(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], fill: str = GREEN, width: int = 5) -> None:
    draw.line((*start, *end), fill=fill, width=width)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    size = 17
    p1 = (end[0] - size * math.cos(angle - math.pi / 6), end[1] - size * math.sin(angle - math.pi / 6))
    p2 = (end[0] - size * math.cos(angle + math.pi / 6), end[1] - size * math.sin(angle + math.pi / 6))
    draw.polygon([end, p1, p2], fill=fill)


def draw_background(draw: ImageDraw.ImageDraw) -> None:
    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=CREAM)
    for i in range(-HEIGHT, WIDTH, 42):
        draw.line((i, 0, i + HEIGHT, HEIGHT), fill="#f0ece3", width=1)
    draw.rectangle((0, 0, WIDTH, 76), fill="#f2eee5")
    draw.line((0, 76, WIDTH, 76), fill=LINE, width=2)
    draw.ellipse((38, 22, 78, 62), outline=GREEN, width=3)
    draw.ellipse((56, 14, 96, 54), outline=NAVY, width=3)
    draw.ellipse((56, 30, 96, 70), outline=GOLD, width=3)
    draw.text((116, 27), "WIRKUNGSÖKONOMIE", font=font(24, True), fill=NAVY)
    draw.text((930, 29), "Von Wissen zu Wirkung", font=font(22, True), fill=GREEN_DARK)


def draw_label(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, fill: str = GREEN_DARK) -> None:
    fnt = font(22, True)
    pad_x, pad_y = 15, 8
    bbox = draw.textbbox((0, 0), text, font=fnt)
    rounded_rect(draw, (x, y, x + bbox[2] + 2 * pad_x, y + bbox[3] + 2 * pad_y), "#eef5ee", "#b8d2c0", 2, 12)
    draw.text((x + pad_x, y + pad_y - 1), text, font=fnt, fill=fill)


def draw_bullets(draw: ImageDraw.ImageDraw, bullets: tuple[str, ...], x: int, y: int) -> None:
    for i, bullet in enumerate(bullets):
        yy = y + i * 52
        color = GREEN if i % 2 == 0 else GOLD
        draw.ellipse((x, yy + 8, x + 22, yy + 30), fill=color)
        draw_wrapped(draw, (x + 38, yy), bullet, font(23, True), INK, 450, 4)


def draw_progress(draw: ImageDraw.ImageDraw, index: int, count: int) -> None:
    x0, y0, w = 90, 650, 1100
    draw.rounded_rectangle((x0, y0, x0 + w, y0 + 10), radius=5, fill="#dfd9ca")
    draw.rounded_rectangle((x0, y0, x0 + int(w * (index + 1) / count), y0 + 10), radius=5, fill=GREEN)
    draw.text((x0, y0 + 20), f"{index + 1:02d} / {count:02d}", font=font(18, True), fill=MUTED)


def visual_data_world(draw: ImageDraw.ImageDraw) -> None:
    center = (910, 330)
    nodes = [
        ("CO2", 700, 210, GREEN),
        ("Daten", 850, 165, BLUE),
        ("KI", 1035, 210, CYAN),
        ("Bildung", 720, 405, GOLD),
        ("Gesundheit", 925, 465, GREEN),
        ("Demokratie", 1090, 380, NAVY),
    ]
    for label, x, y, color in nodes:
        draw.line((center[0], center[1], x, y), fill="#cfd9d2", width=3)
    for label, x, y, color in nodes:
        rounded_rect(draw, (x - 70, y - 34, x + 70, y + 34), PAPER, color, 3, 16)
        draw.text((x - text_width(draw, label, font(22, True)) / 2, y - 13), label, font=font(22, True), fill=color)
    draw.ellipse((835, 255, 985, 405), fill="#eef5ee", outline=GREEN, width=5)
    draw.text((874, 292), "Wissen", font=font(28, True), fill=NAVY)
    draw.text((872, 332), "macht sichtbar", font=font(18, True), fill=GREEN_DARK)


def visual_bridge(draw: ImageDraw.ImageDraw) -> None:
    rounded_rect(draw, (650, 185, 865, 455), "#edf3fa", BLUE, 4, 22)
    rounded_rect(draw, (1015, 185, 1230, 455), "#eef5ee", GREEN, 4, 22)
    draw.text((690, 220), "Wissen", font=font(36, True), fill=BLUE)
    draw.text((1050, 220), "Wirkung", font=font(36, True), fill=GREEN_DARK)
    for i, text in enumerate(["Daten", "Analyse", "Bericht"]):
        draw.text((690, 290 + i * 44), text, font=font(24, True), fill=INK)
    for i, text in enumerate(["Preise", "Regeln", "Kapital"]):
        draw.text((1050, 290 + i * 44), text, font=font(24, True), fill=INK)
    for y in (270, 330, 390):
        draw_arrow(draw, (870, y), (1010, y), GOLD, 5)
    draw.text((872, 465), "Rückkopplung", font=font(30, True), fill=GREEN_DARK)


def visual_thermostat(draw: ImageDraw.ImageDraw) -> None:
    draw.ellipse((690, 190, 910, 410), fill=PAPER, outline=BLUE, width=6)
    draw.text((720, 270), "17°C", font=font(52, True), fill=BLUE)
    draw.text((707, 420), "Thermometer", font=font(25, True), fill=MUTED)
    draw_arrow(draw, (920, 300), (1015, 300), GOLD, 6)
    draw.rounded_rectangle((1025, 190, 1195, 410), radius=84, fill="#eef5ee", outline=GREEN, width=6)
    draw.ellipse((1068, 235, 1152, 319), fill=PAPER, outline=GREEN, width=4)
    draw.line((1110, 319, 1110, 370), fill=GREEN, width=8)
    draw.text((1052, 420), "Thermostat", font=font(25, True), fill=GREEN_DARK)
    draw.text((865, 508), "Messen reicht nicht. Rückkopplung verändert.", font=font(25, True), fill=NAVY)


def visual_apple(draw: ImageDraw.ImageDraw) -> None:
    for x, label, color in [(735, "regional", GREEN), (1035, "weit gereist", RED)]:
        draw.ellipse((x - 65, 205, x + 65, 335), fill="#d85043" if color == RED else "#75a843", outline=NAVY, width=3)
        draw.arc((x - 15, 160, x + 55, 245), 210, 310, fill=GREEN_DARK, width=7)
        rounded_rect(draw, (x - 118, 365, x + 118, 450), PAPER, color, 4, 16)
        draw.text((x - text_width(draw, label, font(27, True)) / 2, 383), label, font=font(27, True), fill=color)
    draw.text((790, 500), "Gleiches Preisschild?", font=font(31, True), fill=NAVY)
    draw.text((778, 542), "Andere Wirkpfade.", font=font(31, True), fill=GREEN_DARK)


def visual_impact(draw: ImageDraw.ImageDraw) -> None:
    draw.text((680, 175), "Output", font=font(36, True), fill=MUTED)
    draw.text((1020, 175), "Wirkung", font=font(36, True), fill=GREEN_DARK)
    pairs = [("Unterrichtsstunden", "Kinder lesen besser"), ("Behandlungen", "Menschen werden gesünder"), ("Aufrufe", "Wirklichkeit wird klarer")]
    for i, (left, right) in enumerate(pairs):
        y = 245 + i * 100
        rounded_rect(draw, (650, y, 890, y + 62), PAPER, LINE, 2, 14)
        rounded_rect(draw, (990, y, 1230, y + 62), "#eef5ee", GREEN, 3, 14)
        draw.text((675, y + 18), left, font=font(21, True), fill=INK)
        draw.text((1015, y + 18), right, font=font(21, True), fill=INK)
        draw_arrow(draw, (900, y + 31), (980, y + 31), GOLD, 4)


def visual_kondratieff(draw: ImageDraw.ImageDraw) -> None:
    points = [(650, 430), (760, 260), (890, 430), (1010, 235), (1160, 430)]
    for i in range(len(points) - 1):
        draw.line((*points[i], *points[i + 1]), fill=GREEN if i >= 2 else BLUE, width=6)
    cards = [
        (705, 470, "5. Kondratieff", "Digitalisierung\nDaten\nWissen\nEffizienz", BLUE),
        (1000, 470, "6. Kondratieff", "Nachhaltigkeit\nResilienz\nGesundheit\nWirkung", GREEN),
    ]
    for x, y, title, body, color in cards:
        rounded_rect(draw, (x, y, x + 230, y + 130), PAPER, color, 4, 16)
        draw.text((x + 22, y + 18), title, font=font(23, True), fill=color)
        draw_wrapped(draw, (x + 22, y + 55), body, font(20, True), INK, 180, 3)
    draw.text((752, 160), "Was wissen wir?", font=font(29, True), fill=BLUE)
    draw.text((992, 160), "Was bewirkt es?", font=font(29, True), fill=GREEN_DARK)


def visual_shift(draw: ImageDraw.ImageDraw) -> None:
    rows = [
        ("Kapital", "Wirkung"),
        ("Reporting", "Rückkopplung"),
        ("Output", "positive Netto-Wirkung"),
        ("Reparatur", "Wirkungsarchitektur"),
    ]
    for i, (left, right) in enumerate(rows):
        y = 170 + i * 88
        rounded_rect(draw, (650, y, 880, y + 58), PAPER, LINE, 2, 14)
        rounded_rect(draw, (1000, y, 1230, y + 58), "#eef5ee", GREEN, 3, 14)
        draw.text((682, y + 17), left, font=font(23, True), fill=MUTED)
        draw.text((1022, y + 17), right, font=font(22, True), fill=GREEN_DARK)
        draw_arrow(draw, (890, y + 29), (990, y + 29), GOLD, 4)


def visual_noncomp(draw: ImageDraw.ImageDraw) -> None:
    rounded_rect(draw, (690, 175, 1130, 300), "#eef5ee", GREEN, 4, 20)
    draw.text((750, 210), "Bio-Baumwolle", font=font(35, True), fill=GREEN_DARK)
    draw.text((794, 255), "gute Teilwirkung", font=font(24, True), fill=GREEN_DARK)
    draw.line((650, 355, 1210, 355), fill=NAVY, width=6)
    draw.text((710, 382), "harte Grenze", font=font(28, True), fill=RED)
    for x in (875, 1035):
        draw.line((x - 35, 405, x + 35, 475), fill=RED, width=8)
        draw.line((x + 35, 405, x - 35, 475), fill=RED, width=8)
    draw.text((785, 515), "Nicht schönrechnen.", font=font(38, True), fill=NAVY)


def visual_not_social_credit(draw: ImageDraw.ImageDraw) -> None:
    left = [("Menschen", RED), ("Personen-Score", RED), ("Überwachung", RED)]
    right = [("Produkte", GREEN), ("Regeln", GREEN), ("Kapitalflüsse", GREEN), ("Programme", GREEN)]
    draw.text((685, 150), "Nicht:", font=font(34, True), fill=RED)
    draw.text((985, 150), "Sondern:", font=font(34, True), fill=GREEN_DARK)
    for i, (label, color) in enumerate(left):
        y = 220 + i * 82
        rounded_rect(draw, (650, y, 900, y + 54), PAPER, color, 3, 14)
        draw.text((680, y + 15), label, font=font(22, True), fill=color)
    for i, (label, color) in enumerate(right):
        y = 210 + i * 68
        rounded_rect(draw, (975, y, 1230, y + 50), "#eef5ee", color, 3, 14)
        draw.text((1005, y + 14), label, font=font(21, True), fill=GREEN_DARK)
    draw.text((758, 522), "Demokratisch begrenzte Wirkungsdaten", font=font(29, True), fill=NAVY)


def visual_final(draw: ImageDraw.ImageDraw) -> None:
    cx, cy = 940, 330
    labels = [("Wissen", BLUE), ("Entscheidung", GOLD), ("Wirkung", GREEN), ("Lernen", CYAN)]
    coords = [(cx, cy - 160), (cx + 220, cy), (cx, cy + 160), (cx - 220, cy)]
    for i, ((label, color), (x, y)) in enumerate(zip(labels, coords)):
        next_xy = coords[(i + 1) % len(coords)]
        draw_arrow(draw, (x, y), (next_xy[0], next_xy[1]), color, 4)
        rounded_rect(draw, (x - 92, y - 34, x + 92, y + 34), PAPER, color, 3, 18)
        draw.text((x - text_width(draw, label, font(22, True)) / 2, y - 13), label, font=font(22, True), fill=color)
    draw.text((805, 330), "Rückkopplung", font=font(34, True), fill=NAVY)


def visual_cta(draw: ImageDraw.ImageDraw) -> None:
    rounded_rect(draw, (670, 185, 1210, 455), PAPER, GREEN, 5, 24)
    draw.text((755, 230), "wirkungsoekonomie.de", font=font(45, True), fill=NAVY)
    for i, item in enumerate(["Journal-Beitrag", "Dossier", "Glossar"]):
        draw_label(draw, 755 + i * 155, 325, item, GREEN_DARK)
    draw.text((780, 505), "Was wird wirklich besser?", font=font(40, True), fill=GREEN_DARK)


VISUALS = {
    "data_world": visual_data_world,
    "bridge": visual_bridge,
    "thermostat": visual_thermostat,
    "apple": visual_apple,
    "impact": visual_impact,
    "kondratieff": visual_kondratieff,
    "shift": visual_shift,
    "noncomp": visual_noncomp,
    "not_social_credit": visual_not_social_credit,
    "final": visual_final,
    "cta": visual_cta,
}


def render_scene(scene: Scene, index: int, count: int) -> Path:
    image = Image.new("RGB", (WIDTH, HEIGHT), CREAM)
    draw = ImageDraw.Draw(image)
    draw_background(draw)
    draw_label(draw, 90, 118, scene.kicker)
    y = draw_wrapped(draw, (90, 174), scene.title, font(52, True), NAVY, 520, 8)
    draw_wrapped(draw, (92, max(292, y + 18)), scene.subtitle, font(27), MUTED, 505, 10)
    draw_bullets(draw, scene.bullets, 100, 430)
    VISUALS[scene.visual](draw)
    draw_progress(draw, index, count)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.1, percent=115, threshold=3))
    target = WORK_DIR / f"scene-{index:02d}.png"
    image.save(target, optimize=True)
    return target


def write_concat_file(scenes: list[Scene], frames: list[Path]) -> Path:
    concat = WORK_DIR / "concat.txt"
    lines: list[str] = []
    for scene, frame in zip(scenes, frames):
        lines.append(f"file '{frame.as_posix()}'")
        lines.append(f"duration {scene.end - scene.start:.3f}")
    lines.append(f"file '{frames[-1].as_posix()}'")
    concat.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return concat


def run() -> None:
    if not AUDIO_SOURCE.exists():
        raise FileNotFoundError(AUDIO_SOURCE)
    if not SCRIPT_SOURCE.exists():
        raise FileNotFoundError(SCRIPT_SOURCE)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    for old in WORK_DIR.glob("scene-*.png"):
        old.unlink()

    duration = audio_duration(AUDIO_SOURCE)
    scenes = scaled_scenes(duration)
    frames = [render_scene(scene, index, len(scenes)) for index, scene in enumerate(scenes)]
    frames[0].replace(POSTER_TARGET)
    frames[0] = POSTER_TARGET
    concat = write_concat_file(scenes, frames)
    STORYBOARD_TARGET.write_text(
        json.dumps(
            [
                {
                    "start": round(scene.start, 3),
                    "end": round(scene.end, 3),
                    "title": scene.title,
                    "visual": scene.visual,
                }
                for scene in scenes
            ],
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat),
            "-i",
            str(AUDIO_SOURCE),
            "-vf",
            f"fps={FPS},format=yuv420p",
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            "24",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-t",
            f"{duration:.3f}",
            "-movflags",
            "+faststart",
            "-shortest",
            str(VIDEO_TARGET),
        ],
        check=True,
    )


if __name__ == "__main__":
    run()
