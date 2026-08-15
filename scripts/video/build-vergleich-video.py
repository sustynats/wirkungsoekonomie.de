#!/usr/bin/env python3
from __future__ import annotations

import math
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
AUDIO_SOURCE = Path("unterschiedGWÖ_1-esv2-89p-bg-10p-music-10p.wav")
OUT_DIR = ROOT / "assets" / "video"
WORK_DIR = ROOT / "tmp" / "vergleich-video"
VIDEO_TARGET = OUT_DIR / "vergleich-wirkungsoekonomie.mp4"
POSTER_TARGET = OUT_DIR / "vergleich-wirkungsoekonomie-poster.png"

WIDTH = 1280
HEIGHT = 720
FPS = 24

FONT_REGULAR = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
FONT_BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")

NAVY = "#0b1020"
INK = "#182033"
MUTED = "#5d6674"
GREEN = "#2f7d5c"
GREEN_DARK = "#1f5e43"
GOLD = "#c4a052"
CREAM = "#f7f4ec"
PAPER = "#fffdf7"
SOFT = "#e8f1e9"
LINE = "#d9deca"
RED = "#8b3d37"
BLUE = "#315f82"


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
        0.0,
        17.2,
        "Ausgangspunkt",
        "Warum die WÖk weitergeht",
        "Wir haben Ziele. Aber Ziele allein verändern noch kein System.",
        ("Gemeinwohl", "Nachhaltigkeit", "Demokratie", "Wirkung"),
        "goals",
    ),
    Scene(
        17.2,
        55.6,
        "Das einfache Bild",
        "Kompass, Karte, Thermostat",
        "Ein Kompass zeigt Richtung. Erst Rückkopplung verändert den Raum.",
        ("Kompass: Richtung", "Karte: Zielraum", "Thermometer: Zustand", "Thermostat: Steuerung"),
        "thermostat",
    ),
    Scene(
        55.6,
        82.9,
        "Vier Ansätze",
        "Bilanz. Zielraum. Kompass. Architektur.",
        "GWÖ, Donut und Mazzucato sind wichtige Vorarbeiten. Die WÖk baut die Rückkopplung.",
        ("GWÖ: Verantwortung sichtbar machen", "Donut: Grenzen beschreiben", "Mazzucato: Missionen gestalten", "WÖk: Wirkung zurückführen"),
        "four_models",
    ),
    Scene(
        82.9,
        120.5,
        "Wirkung beginnt früher",
        "Auslöser mit Wirkungspotenzial",
        "Produkte, Preise, Gesetze, Kapitalflüsse, Algorithmen und Narrative können Wirkung auslösen.",
        ("Produkt", "Preis", "Gesetz", "Kapitalfluss", "Algorithmus", "Narrativ"),
        "triggers",
    ),
    Scene(
        120.5,
        176.2,
        "Medien und Sprache",
        "Auch Debatten wirken",
        "Beim Heizgesetz wirkte nicht nur die Heizung. Auch der öffentliche Frame veränderte den Wirkungsraum.",
        ("Heiz-Hammer", "Verbot", "Angst", "Verzögerung", "fossiler Lock-in", "Vertrauensverlust"),
        "media_heat",
    ),
    Scene(
        176.2,
        231.1,
        "Öffentlichkeit",
        "Medien sind Wirkungsräume",
        "Die Kernwirkung eines Mediums entsteht nicht nur im Büro, sondern im öffentlichen Resonanzraum.",
        ("Was wird sichtbar?", "Was wird glaubwürdig?", "Was polarisiert?", "Was stärkt Vertrauen?"),
        "public_sphere",
    ),
    Scene(
        231.1,
        263.4,
        "SDG+",
        "Mensch. Planet. Demokratie.",
        "Die WÖk erweitert den Blick auf Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit und Vertrauen.",
        ("SDGs", "Agenda 2030", "Medienqualität", "Rechtsstaatlichkeit", "Diskursfähigkeit", "digitale Selbstbestimmung"),
        "sdgplus",
    ),
    Scene(
        263.4,
        302.0,
        "Beispiel Apfel",
        "Gute Wirkung muss im System ankommen",
        "Daten bleiben nicht im Bericht. Sie wirken in Preise, Steuern, Beschaffung und Kaufentscheidungen zurück.",
        ("Wasser", "Boden", "CO₂", "Arbeitsbedingungen", "Gesundheit", "Preis"),
        "apple",
    ),
    Scene(
        302.0,
        329.4,
        "Nichtkompensation",
        "Schäden sind keine Rechenposten",
        "Kinderarbeit, Verdrängung oder demokratische Zerstörung lassen sich nicht schönrechnen.",
        ("Grenzen statt Durchschnitt", "positive Netto-Wirkung", "Reverse Merit Order"),
        "noncomp",
    ),
    Scene(
        329.4,
        354.1,
        "Nicht nur Wirtschaft",
        "WÖk ist Wirkungsarchitektur",
        "Sie betrifft Produkte, Kapital, Einkommen, Rente, Wohnen, Gesundheit, Medien, Sprache und Demokratie.",
        ("Märkte", "Mieten", "Plattformen", "Sprache", "Vertrauen", "Demokratie"),
        "system",
    ),
    Scene(
        354.1,
        384.1,
        "Formel",
        "Wirkung statt Kapital",
        "Was bewirkt unser Handeln wirklich für Mensch, Planet und Demokratie?",
        ("GWÖ bilanziert Verantwortung", "Donut beschreibt Grenzen", "Mazzucato gibt den Kompass", "WÖk baut die Architektur"),
        "final",
    ),
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


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


def draw_background(draw: ImageDraw.ImageDraw) -> None:
    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=CREAM)
    for i in range(0, WIDTH + HEIGHT, 44):
        color = "#f1eee5" if i % 88 else "#edf3eb"
        draw.line((i, 0, i - HEIGHT, HEIGHT), fill=color, width=1)
    draw.rectangle((0, 0, WIDTH, 74), fill="#f2eee5")
    draw.line((0, 74, WIDTH, 74), fill=LINE, width=2)
    draw.ellipse((36, 22, 76, 62), outline=GREEN, width=3)
    draw.ellipse((54, 14, 94, 54), outline=NAVY, width=3)
    draw.ellipse((54, 30, 94, 70), outline=GOLD, width=3)
    draw.text((112, 27), "WIRKUNGSÖKONOMIE", font=font(24, True), fill=NAVY)


def draw_progress(draw: ImageDraw.ImageDraw, index: int) -> None:
    x0, y0, w = 90, 650, 1100
    draw.rounded_rectangle((x0, y0, x0 + w, y0 + 10), radius=5, fill="#dfd9ca")
    draw.rounded_rectangle((x0, y0, x0 + int(w * (index + 1) / len(SCENES)), y0 + 10), radius=5, fill=GREEN)
    draw.text((x0, y0 + 20), f"{index + 1:02d} / {len(SCENES):02d}", font=font(18, True), fill=MUTED)


def draw_label(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, fill: str = GREEN_DARK) -> None:
    fnt = font(22, True)
    pad_x, pad_y = 15, 8
    bbox = draw.textbbox((0, 0), text, font=fnt)
    rounded_rect(draw, (x, y, x + bbox[2] + 2 * pad_x, y + bbox[3] + 2 * pad_y), "#eef5ee", "#b8d2c0", 2, 12)
    draw.text((x + pad_x, y + pad_y - 1), text, font=fnt, fill=fill)


def draw_bullets(draw: ImageDraw.ImageDraw, bullets: tuple[str, ...], x: int, y: int, max_width: int) -> None:
    fnt = font(25, True)
    sub = font(21)
    for i, bullet in enumerate(bullets):
        yy = y + i * 54
        draw.ellipse((x, yy + 9, x + 21, yy + 30), fill=GREEN if i % 2 == 0 else GOLD)
        draw.text((x + 36, yy), bullet, font=fnt if len(bullet) < 22 else sub, fill=INK)


def draw_arrow(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], fill: str = GREEN, width: int = 5) -> None:
    draw.line((*start, *end), fill=fill, width=width)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    size = 16
    p1 = (end[0] - size * math.cos(angle - math.pi / 6), end[1] - size * math.sin(angle - math.pi / 6))
    p2 = (end[0] - size * math.cos(angle + math.pi / 6), end[1] - size * math.sin(angle + math.pi / 6))
    draw.polygon([end, p1, p2], fill=fill)


def visual_goals(draw: ImageDraw.ImageDraw) -> None:
    labels = [("Gemeinwohl", GREEN), ("Donut", BLUE), ("Mission", GOLD), ("WÖk", NAVY)]
    cx, cy = 930, 320
    for i, (label, color) in enumerate(labels):
        angle = -math.pi / 2 + i * math.pi / 2
        x = cx + int(math.cos(angle) * 150)
        y = cy + int(math.sin(angle) * 115)
        rounded_rect(draw, (x - 90, y - 38, x + 90, y + 38), "#fffdf7", color, 4, 18)
        draw.text((x - draw.textbbox((0, 0), label, font=font(24, True))[2] / 2, y - 14), label, font=font(24, True), fill=color)
    draw_arrow(draw, (930, 300), (930, 430), GREEN, 6)
    draw.text((814, 450), "Rückkopplung", font=font(31, True), fill=GREEN_DARK)


def visual_thermostat(draw: ImageDraw.ImageDraw) -> None:
    items = [("Kompass", "Richtung"), ("Karte", "Raum"), ("Thermometer", "Zustand"), ("Thermostat", "Steuerung")]
    for i, (a, b) in enumerate(items):
        x = 680 + (i % 2) * 250
        y = 180 + (i // 2) * 190
        rounded_rect(draw, (x, y, x + 210, y + 130), PAPER, GREEN if i == 3 else LINE, 4 if i == 3 else 2, 18)
        draw.text((x + 24, y + 25), a, font=font(27, True), fill=NAVY)
        draw.text((x + 24, y + 70), b, font=font(23), fill=GREEN_DARK if i == 3 else MUTED)
    draw_arrow(draw, (805, 342), (930, 342), GREEN, 5)


def visual_four_models(draw: ImageDraw.ImageDraw) -> None:
    rows = [("GWÖ", "Bilanz"), ("Donut", "Grenzen"), ("Mazzucato", "Kompass"), ("WÖk", "Architektur")]
    for i, (left, right) in enumerate(rows):
        y = 165 + i * 88
        rounded_rect(draw, (695, y, 1125, y + 60), PAPER, GREEN if left == "WÖk" else LINE, 3, 14)
        draw.text((720, y + 15), left, font=font(25, True), fill=NAVY)
        draw.text((890, y + 15), right, font=font(25, True), fill=GREEN_DARK if left == "WÖk" else MUTED)


def visual_triggers(draw: ImageDraw.ImageDraw) -> None:
    points = [(760, 185), (970, 185), (1120, 310), (970, 455), (760, 455), (640, 310)]
    center = (885, 320)
    for p in points:
        draw_arrow(draw, p, center, GOLD, 3)
    for i, (p, label) in enumerate(zip(points, ["Produkt", "Preis", "Gesetz", "Kapital", "Algorithmus", "Narrativ"])):
        rounded_rect(draw, (p[0] - 76, p[1] - 28, p[0] + 76, p[1] + 28), PAPER, LINE, 2, 12)
        draw.text((p[0] - draw.textbbox((0, 0), label, font=font(20, True))[2] / 2, p[1] - 12), label, font=font(20, True), fill=INK)
    draw.ellipse((830, 265, 940, 375), fill=SOFT, outline=GREEN, width=4)
    draw.text((845, 305), "Wirkung", font=font(23, True), fill=GREEN_DARK)


def visual_media_heat(draw: ImageDraw.ImageDraw) -> None:
    rounded_rect(draw, (660, 170, 1130, 260), "#f7e8e4", RED, 3, 16)
    draw.text((700, 198), "Heiz-Hammer", font=font(38, True), fill=RED)
    draw_arrow(draw, (895, 270), (895, 350), RED, 5)
    labels = ["Angst", "Verzögerung", "Lock-in", "Vertrauensverlust"]
    for i, label in enumerate(labels):
        x = 655 + i * 122
        y = 375 + (i % 2) * 42
        rounded_rect(draw, (x, y, x + 170, y + 54), PAPER, LINE, 2, 14)
        draw.text((x + 18, y + 15), label, font=font(21, True), fill=INK)


def visual_public_sphere(draw: ImageDraw.ImageDraw) -> None:
    for r, color in [(170, "#d9eadf"), (120, "#e8f1e3"), (70, "#fffdf7")]:
        draw.ellipse((905 - r, 330 - r, 905 + r, 330 + r), outline=color, width=18)
    draw.ellipse((840, 265, 970, 395), fill=PAPER, outline=GREEN, width=4)
    draw.text((857, 303), "Öffentlichkeit", font=font(22, True), fill=NAVY)
    for angle, label in [(-2.5, "Sprache"), (-1.2, "Plattform"), (0.1, "Frame"), (1.35, "Vertrauen"), (2.55, "Quellen")]:
        x = 905 + int(math.cos(angle) * 225)
        y = 330 + int(math.sin(angle) * 160)
        draw_label(draw, x - 68, y - 22, label, GREEN_DARK)


def visual_sdgplus(draw: ImageDraw.ImageDraw) -> None:
    draw.ellipse((740, 190, 1030, 480), fill=SOFT, outline=GREEN, width=5)
    draw.text((790, 268), "Mensch", font=font(32, True), fill=NAVY)
    draw.text((820, 325), "Planet", font=font(32, True), fill=GREEN_DARK)
    draw.text((780, 382), "Demokratie", font=font(32, True), fill=BLUE)
    draw.text((1048, 300), "+", font=font(84, True), fill=GOLD)


def visual_apple(draw: ImageDraw.ImageDraw) -> None:
    draw.ellipse((770, 190, 970, 390), fill="#c8433b", outline=RED, width=5)
    draw.ellipse((870, 150, 930, 205), fill=GREEN, outline=GREEN_DARK, width=2)
    draw.text((796, 420), "Preis ≠ Wirkung", font=font(34, True), fill=NAVY)
    for i, label in enumerate(["Wasser", "Boden", "CO₂", "Arbeit", "Gesundheit"]):
        draw_label(draw, 620 + (i % 3) * 180, 500 + (i // 3) * 55, label)


def visual_noncomp(draw: ImageDraw.ImageDraw) -> None:
    rounded_rect(draw, (665, 180, 1145, 275), "#f6e6e1", RED, 4, 18)
    draw.text((705, 207), "Nicht schönrechnen", font=font(38, True), fill=RED)
    draw.line((705, 350, 1105, 350), fill=NAVY, width=5)
    draw.text((704, 295), "gute Teilwirkung", font=font(24, True), fill=GREEN_DARK)
    draw.text((910, 380), "harte Grenze", font=font(24, True), fill=RED)
    draw.line((1010, 300, 1010, 435), fill=RED, width=7)


def visual_system(draw: ImageDraw.ImageDraw) -> None:
    labels = ["Produkte", "Kapital", "Einkommen", "Wohnen", "Gesundheit", "Medien", "Sprache", "Demokratie"]
    cx, cy = 900, 330
    for i, label in enumerate(labels):
        angle = i / len(labels) * math.tau
        x = cx + int(math.cos(angle) * 220)
        y = cy + int(math.sin(angle) * 160)
        draw_arrow(draw, (x, y), (cx, cy), GREEN if i % 2 else GOLD, 3)
        draw.text((x - 62, y - 12), label, font=font(19, True), fill=INK)
    draw.ellipse((830, 260, 970, 400), fill=PAPER, outline=GREEN, width=5)
    draw.text((856, 302), "WÖk", font=font(34, True), fill=NAVY)
    draw.text((836, 346), "Wirkung", font=font(22, True), fill=GREEN_DARK)


def visual_final(draw: ImageDraw.ImageDraw) -> None:
    rows = [("GWÖ", "Verantwortung"), ("Donut", "Grenzen"), ("Mazzucato", "Kompass"), ("WÖk", "Architektur")]
    for i, (left, right) in enumerate(rows):
        y = 175 + i * 72
        color = GREEN if left == "WÖk" else LINE
        rounded_rect(draw, (650, y, 1135, y + 50), PAPER, color, 3, 12)
        draw.text((680, y + 12), left, font=font(22, True), fill=NAVY)
        draw.text((850, y + 12), right, font=font(22, True), fill=GREEN_DARK if left == "WÖk" else MUTED)
    draw.text((705, 505), "Mensch · Planet · Demokratie", font=font(33, True), fill=NAVY)


VISUALS = {
    "goals": visual_goals,
    "thermostat": visual_thermostat,
    "four_models": visual_four_models,
    "triggers": visual_triggers,
    "media_heat": visual_media_heat,
    "public_sphere": visual_public_sphere,
    "sdgplus": visual_sdgplus,
    "apple": visual_apple,
    "noncomp": visual_noncomp,
    "system": visual_system,
    "final": visual_final,
}


def render_scene(scene: Scene, index: int) -> Path:
    image = Image.new("RGB", (WIDTH, HEIGHT), CREAM)
    draw = ImageDraw.Draw(image)
    draw_background(draw)
    draw_label(draw, 90, 118, scene.kicker)
    draw_wrapped(draw, (90, 174), scene.title, font(54, True), NAVY, 520, 8)
    draw_wrapped(draw, (92, 310), scene.subtitle, font(27), MUTED, 505, 10)
    draw_bullets(draw, scene.bullets, 100, 430, 460)
    VISUALS[scene.visual](draw)
    draw_progress(draw, index)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=3))
    target = WORK_DIR / f"scene-{index:02d}.png"
    image.save(target, optimize=True)
    return target


def write_concat_file(frames: list[Path]) -> Path:
    concat = WORK_DIR / "concat.txt"
    lines: list[str] = []
    for scene, frame in zip(SCENES, frames):
        lines.append(f"file '{frame.as_posix()}'")
        lines.append(f"duration {scene.end - scene.start:.3f}")
    lines.append(f"file '{frames[-1].as_posix()}'")
    concat.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return concat


def run() -> None:
    if not AUDIO_SOURCE.exists():
        raise FileNotFoundError(AUDIO_SOURCE)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    for old in WORK_DIR.glob("scene-*.png"):
        old.unlink()

    frames = [render_scene(scene, index) for index, scene in enumerate(SCENES)]
    frames[0].replace(POSTER_TARGET)
    frames[0] = POSTER_TARGET
    concat = write_concat_file(frames)

    cmd = [
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
        "-movflags",
        "+faststart",
        "-shortest",
        str(VIDEO_TARGET),
    ]
    subprocess.run(cmd, check=True)


if __name__ == "__main__":
    run()
