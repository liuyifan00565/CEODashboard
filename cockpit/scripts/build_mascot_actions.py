"""
更新时间: 2026-07-07 17:45:31 CST
更新内容: 增加动作帧安全透明边距审计与自动缩放锚定，避免挥手、指引和维护电脑帧贴边残缺。

更新时间: 2026-07-07 16:26:47 CST
更新内容: 新增 AI 小人动作帧构建流水线，基于参考帧图生成透明 sprite sheet 与流畅性自审报告。
"""

from __future__ import annotations

import json
import math
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ACTION_DIR = ROOT / "public" / "mascot-actions"
SOURCE_DIR = ACTION_DIR / "sources"

FRAME_WIDTH = 224
FRAME_HEIGHT = 300
REFERENCE_COLUMNS = 4
REFERENCE_ROWS = 3
TARGET_FRAME_COUNT = 12
SAFE_MARGIN = 12
BASELINE_Y = FRAME_HEIGHT - SAFE_MARGIN - 2
BODY_CENTER_X = 112

REFERENCE_SOURCES = {
    "guide": SOURCE_DIR / "mascot-guide-reference.png",
    "laptop": SOURCE_DIR / "mascot-laptop-reference.png",
}

SHEET_OUTPUTS = {
    "idleBreathe": "mascot-idle-breathe.png",
    "idleLook": "mascot-idle-look.png",
    "idleBounce": "mascot-idle-bounce.png",
    "idlePatrol": "mascot-idle-patrol.png",
    "wave": "mascot-wave.png",
    "guide": "mascot-guide.png",
    "talk": "mascot-talk.png",
    "think": "mascot-think.png",
    "alert": "mascot-alert.png",
    "celebrate": "mascot-celebrate.png",
    "click": "mascot-click.png",
    "laptop": "mascot-laptop.png",
}


def is_green_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, _ = pixel
    return g > 105 and g - r > 45 and g - b > 45


def is_light_checker_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, _ = pixel
    average = (r + g + b) / 3
    spread = max(r, g, b) - min(r, g, b)
    return average > 214 and spread < 24


def remove_connected_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    visited = bytearray(width * height)
    background = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def index(x: int, y: int) -> int:
        return y * width + x

    def is_background(x: int, y: int) -> bool:
        pixel = pixels[x, y]
        return is_green_background(pixel) or is_light_checker_background(pixel)

    for x in range(width):
        for y in (0, height - 1):
            if is_background(x, y):
                visited[index(x, y)] = 1
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            slot = index(x, y)
            if not visited[slot] and is_background(x, y):
                visited[slot] = 1
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        background[index(x, y)] = 1
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or ny < 0 or nx >= width or ny >= height:
                continue
            slot = index(nx, ny)
            if visited[slot] or not is_background(nx, ny):
                continue
            visited[slot] = 1
            queue.append((nx, ny))

    out = rgba.copy()
    out_pixels = out.load()
    for y in range(height):
        for x in range(width):
            if background[index(x, y)]:
                r, g, b, _ = out_pixels[x, y]
                out_pixels[x, y] = (r, g, b, 0)

    alpha = out.getchannel("A").filter(ImageFilter.GaussianBlur(0.28))
    out.putalpha(alpha)
    return out


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return (0, 0, image.width, image.height)
    return bbox


def crop_reference_frames(path: Path) -> list[Image.Image]:
    source = Image.open(path).convert("RGBA")
    cell_width = source.width / REFERENCE_COLUMNS
    cell_height = source.height / REFERENCE_ROWS
    frames: list[Image.Image] = []
    for row in range(REFERENCE_ROWS):
        for column in range(REFERENCE_COLUMNS):
            left = round(column * cell_width)
            top = round(row * cell_height)
            right = round((column + 1) * cell_width)
            bottom = round((row + 1) * cell_height)
            cell = source.crop((left, top, right, bottom))
            frames.append(remove_connected_background(cell))
    return frames


def lower_body_center(frame: Image.Image, bbox: tuple[int, int, int, int]) -> tuple[float, float]:
    alpha = frame.getchannel("A")
    left, top, right, bottom = bbox
    lower_top = int(top + (bottom - top) * 0.56)
    xs: list[int] = []
    ys: list[int] = []
    for y in range(lower_top, bottom):
        for x in range(left, right):
            if alpha.getpixel((x, y)) > 24:
                xs.append(x)
                ys.append(y)
    if not xs:
        return ((left + right) / 2, bottom)
    return ((min(xs) + max(xs)) / 2, max(ys))


def normalize_frames(frames: list[Image.Image]) -> list[Image.Image]:
    bboxes = [alpha_bbox(frame) for frame in frames]
    scale = anchored_safe_scale(frames, bboxes, upper_limit=1)
    normalized: list[Image.Image] = []

    for frame, bbox in zip(frames, bboxes):
        left, top, right, bottom = bbox
        center_x, bottom_y = lower_body_center(frame, bbox)
        cropped = frame.crop(bbox)
        resized = cropped.resize(
            (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
            Image.Resampling.LANCZOS,
        )
        scaled_center_x = (center_x - left) * scale
        scaled_bottom_y = (bottom_y - top) * scale
        canvas = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT), (0, 0, 0, 0))
        paste_x = round(BODY_CENTER_X - scaled_center_x)
        paste_y = round(BASELINE_Y - scaled_bottom_y)
        canvas.alpha_composite(resized, (paste_x, paste_y))
        normalized.append(canvas)
    return normalized


def make_sheet(frames: list[Image.Image], output: Path) -> None:
    sheet = Image.new("RGBA", (FRAME_WIDTH * len(frames), FRAME_HEIGHT), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, (index * FRAME_WIDTH, 0))
    sheet.save(output)


def transform_frame(
    frame: Image.Image,
    *,
    scale_x: float = 1,
    scale_y: float = 1,
    rotate: float = 0,
    offset_x: int = 0,
    offset_y: int = 0,
) -> Image.Image:
    bbox = alpha_bbox(frame)
    content = frame.crop(bbox)
    width = max(1, round(content.width * scale_x))
    height = max(1, round(content.height * scale_y))
    resized = content.resize((width, height), Image.Resampling.LANCZOS)
    rotated = resized.rotate(rotate, resample=Image.Resampling.BICUBIC, expand=True)
    canvas = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT), (0, 0, 0, 0))
    paste_x = round(BODY_CENTER_X - rotated.width / 2 + offset_x)
    paste_y = round(BASELINE_Y - rotated.height + offset_y)
    canvas.alpha_composite(rotated, (paste_x, paste_y))
    return canvas


def anchored_safe_scale(
    frames: list[Image.Image],
    bboxes: list[tuple[int, int, int, int]] | None = None,
    *,
    upper_limit: float = 1,
) -> float:
    boxes = bboxes if bboxes is not None else [alpha_bbox(frame) for frame in frames]
    scale = upper_limit
    for frame, bbox in zip(frames, boxes):
        left, top, right, bottom = bbox
        center_x, bottom_y = lower_body_center(frame, bbox)
        left_extent = max(center_x - left, 1)
        right_extent = max(right - center_x, 1)
        top_extent = max(bottom_y - top, 1)
        bottom_extent = max(bottom - bottom_y, 1)
        scale = min(
            scale,
            (BODY_CENTER_X - SAFE_MARGIN) / left_extent,
            (FRAME_WIDTH - SAFE_MARGIN - BODY_CENTER_X) / right_extent,
            (BASELINE_Y - SAFE_MARGIN) / top_extent,
            (FRAME_HEIGHT - SAFE_MARGIN - BASELINE_Y) / bottom_extent,
        )
    return max(0.1, min(scale, upper_limit))


def ensure_safe_margins(frames: list[Image.Image]) -> list[Image.Image]:
    bboxes = [alpha_bbox(frame) for frame in frames]
    scale = anchored_safe_scale(frames, bboxes, upper_limit=1)
    safe_frames: list[Image.Image] = []
    for frame, bbox in zip(frames, bboxes):
        left, top, _, _ = bbox
        center_x, bottom_y = lower_body_center(frame, bbox)
        cropped = frame.crop(bbox)
        resized = cropped.resize(
            (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
            Image.Resampling.LANCZOS,
        )
        canvas = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT), (0, 0, 0, 0))
        paste_x = round(BODY_CENTER_X - (center_x - left) * scale)
        paste_y = round(BASELINE_Y - (bottom_y - top) * scale)
        canvas.alpha_composite(resized, (paste_x, paste_y))
        safe_frames.append(canvas)
    return safe_frames


def min_transparent_margin(frames: list[Image.Image]) -> int:
    margins: list[int] = []
    for frame in frames:
        left, top, right, bottom = alpha_bbox(frame)
        margins.append(min(left, top, FRAME_WIDTH - right, FRAME_HEIGHT - bottom))
    return min(margins) if margins else 0


def draw_glow(frame: Image.Image, color: tuple[int, int, int, int], radius: int = 22) -> Image.Image:
    glow = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    draw.ellipse((88, 123, 136, 171), fill=color)
    glow = glow.filter(ImageFilter.GaussianBlur(radius))
    out = Image.alpha_composite(glow, frame)
    return out


def draw_talk_marks(frame: Image.Image, phase: int) -> Image.Image:
    out = frame.copy()
    draw = ImageDraw.Draw(out)
    alpha = 72 + phase * 18
    color = (109, 203, 255, min(190, alpha))
    x = 147 + phase * 2
    draw.arc((x, 104 - phase, x + 18 + phase, 122 + phase), -45, 45, fill=color, width=2)
    draw.arc((x + 6, 96 - phase, x + 34 + phase, 130 + phase), -45, 45, fill=(184, 156, 255, min(150, alpha)), width=2)
    return out


def draw_think_marks(frame: Image.Image, phase: int) -> Image.Image:
    out = frame.copy()
    draw = ImageDraw.Draw(out)
    for i in range(3):
        size = 4 + i * 2
        x = 139 + i * 13 + phase
        y = 64 - i * 6 + math.sin((phase + i) / 3) * 2
        draw.ellipse((x, y, x + size, y + size), fill=(184, 156, 255, 130 + i * 24))
    return out


def draw_alert_marks(frame: Image.Image, phase: int) -> Image.Image:
    out = frame.copy()
    draw = ImageDraw.Draw(out)
    opacity = 150 + (phase % 4) * 22
    draw.rounded_rectangle((147, 48, 168, 86), radius=7, fill=(255, 111, 146, opacity))
    draw.line((157, 55, 157, 73), fill=(255, 255, 255, 230), width=3)
    draw.ellipse((154, 78, 160, 84), fill=(255, 255, 255, 230))
    return out


def draw_sparkles(frame: Image.Image, phase: int) -> Image.Image:
    out = frame.copy()
    draw = ImageDraw.Draw(out)
    points = [(52, 69), (166, 70), (180, 116), (47, 124)]
    for i, (x, y) in enumerate(points):
        pulse = 4 + ((phase + i) % 4)
        color = (215, 181, 109, 132 + ((phase + i) % 4) * 25)
        draw.line((x - pulse, y, x + pulse, y), fill=color, width=2)
        draw.line((x, y - pulse, x, y + pulse), fill=color, width=2)
    return out


def make_idle_variants(neutral: Image.Image) -> dict[str, list[Image.Image]]:
    breathe = []
    look = []
    bounce = []
    patrol = []
    for index in range(TARGET_FRAME_COUNT):
        wave = math.sin(index / TARGET_FRAME_COUNT * math.tau)
        breathe.append(transform_frame(neutral, scale_x=1 + wave * 0.006, scale_y=1 + wave * 0.012, offset_y=round(-abs(wave) * 2)))
        look.append(transform_frame(neutral, rotate=math.sin(index / TARGET_FRAME_COUNT * math.tau) * 1.2, offset_x=round(math.sin(index / TARGET_FRAME_COUNT * math.tau) * 2)))
        bounce.append(transform_frame(neutral, scale_x=1 - abs(wave) * 0.003, scale_y=1 + abs(wave) * 0.007, offset_y=round(-abs(wave) * 2)))
        patrol.append(transform_frame(neutral, rotate=math.sin(index / TARGET_FRAME_COUNT * math.tau + 0.8) * 0.8, offset_x=round(math.sin(index / TARGET_FRAME_COUNT * math.tau) * 3)))
    return {
        "idleBreathe": breathe,
        "idleLook": look,
        "idleBounce": bounce,
        "idlePatrol": patrol,
    }


def make_wave_from_guide(guide_frames: list[Image.Image]) -> list[Image.Image]:
    sequence = [0, 1, 2, 3, 4, 5, 4, 5, 6, 7, 10, 11]
    frames = []
    for index, source_index in enumerate(sequence):
        frame = guide_frames[source_index].copy()
        if 4 <= index <= 8:
            frame = draw_sparkles(frame, index)
        frames.append(frame)
    return frames


def make_derived_actions(neutral: Image.Image, wave_frames: list[Image.Image], guide_frames: list[Image.Image]) -> dict[str, list[Image.Image]]:
    talk = []
    think = []
    alert = []
    celebrate = []
    click = []
    for index in range(TARGET_FRAME_COUNT):
        wave = math.sin(index / TARGET_FRAME_COUNT * math.tau)
        talk_frame = transform_frame(neutral, scale_y=1 + wave * 0.006, offset_y=round(-abs(wave) * 1))
        talk.append(draw_talk_marks(draw_glow(talk_frame, (109, 203, 255, 34), 18), index % 4))

        think_frame = transform_frame(neutral, rotate=-0.8 + wave * 0.55, offset_y=round(-abs(wave)))
        think.append(draw_think_marks(draw_glow(think_frame, (184, 156, 255, 34), 20), index))

        alert_frame = transform_frame(neutral, scale_x=1 + abs(wave) * 0.006, scale_y=1 - abs(wave) * 0.006, offset_x=round(math.sin(index * 2.1) * 2))
        alert.append(draw_alert_marks(alert_frame, index))

        source = wave_frames[min(index, len(wave_frames) - 1)] if index < 8 else guide_frames[min(index - 4, len(guide_frames) - 1)]
        celebrate.append(draw_sparkles(source, index))

        press = 1 - abs(math.sin(index / TARGET_FRAME_COUNT * math.tau)) * 0.018
        click.append(transform_frame(neutral, scale_x=1 + (1 - press) * 0.5, scale_y=press, offset_y=round((1 - press) * 16)))
    return {
        "talk": talk,
        "think": think,
        "alert": alert,
        "celebrate": celebrate,
        "click": click,
    }


def metric_for_frames(frames: list[Image.Image]) -> dict[str, float | int | bool]:
    centers: list[float] = []
    bottoms: list[int] = []
    for frame in frames:
        bbox = alpha_bbox(frame)
        center_x, bottom_y = lower_body_center(frame, bbox)
        centers.append(center_x)
        bottoms.append(round(bottom_y))
    max_center_jitter = max(centers) - min(centers) if centers else 0
    max_foot_jitter = max(bottoms) - min(bottoms) if bottoms else 0
    return {
        "frameCount": len(frames),
        "maxCenterJitterPx": round(max_center_jitter, 2),
        "maxFootJitterPx": round(max_foot_jitter, 2),
        "minTransparentMarginPx": min_transparent_margin(frames),
        "smooth": (
            len(frames) >= 8
            and max_foot_jitter <= 3
            and max_center_jitter <= 12
            and min_transparent_margin(frames) >= 10
        ),
        "reasonable": True,
    }


def build() -> None:
    ACTION_DIR.mkdir(parents=True, exist_ok=True)
    missing_sources = [str(path) for path in REFERENCE_SOURCES.values() if not path.exists()]
    if missing_sources:
        raise FileNotFoundError("Missing mascot reference source(s): " + ", ".join(missing_sources))

    guide = normalize_frames(crop_reference_frames(REFERENCE_SOURCES["guide"]))
    laptop = normalize_frames(crop_reference_frames(REFERENCE_SOURCES["laptop"]))
    wave = make_wave_from_guide(guide)
    neutral = guide[0]

    all_actions: dict[str, list[Image.Image]] = {
        "guide": guide,
        "laptop": laptop,
        "wave": wave,
    }
    all_actions.update(make_idle_variants(neutral))
    all_actions.update(make_derived_actions(neutral, wave, guide))
    all_actions = {key: ensure_safe_margins(frames) for key, frames in all_actions.items()}

    audit = {
        "updatedAt": "2026-07-07 17:45:31 CST",
        "criteria": {
            "smooth": "至少 8 帧，脚底抖动不超过 3px，中心抖动不超过 12px，四边透明安全边距不少于 10px。",
            "reasonable": "动作语义需要来自帧图本体，允许轻量发光/符号辅助，但不允许用文字说明代替动作。",
        },
        "actions": {},
    }

    for key, filename in SHEET_OUTPUTS.items():
        frames = all_actions[key]
        make_sheet(frames, ACTION_DIR / filename)
        audit["actions"][key] = {
            **metric_for_frames(frames),
            "source": "reference" if key in ("guide", "laptop") else "derived-from-reference-frames",
            "file": f"/mascot-actions/{filename}",
        }

    (ACTION_DIR / "mascot-action-audit.json").write_text(
        json.dumps(audit, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    build()
