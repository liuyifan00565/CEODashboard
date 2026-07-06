"""
更新时间: 2026-07-06 14:19:58 CST
更新内容: 锁定当前灰模基准后建立 MASCOT_PART_MAP 分件清单，便于后续二级形体和材质分区精修。
"""
from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "cockpit" / "public" / "models" / "ai-mascot.glb"
LOGO_IMAGE = ROOT / "logo.png"

MASCOT_PART_MAP = {
    "head": [
        "HeadCtrl",
        "helmet-back-shell",
        "helmet-front-violet-panel",
        "helmet-wing-logo",
    ],
    "outer_helmet": [
        "transparent-glass-dome",
        "glass-upper-white-highlight",
        "glass-right-white-highlight",
    ],
    "inner_face": [
        "face-cushion-volume",
        "soft-face-panel",
    ],
    "facial_features": [
        "eye--0.21",
        "eye-0.21",
        "left-cheek",
        "right-cheek",
        "smile-mouth",
    ],
    "accessories": [
        "left-headphone-shell",
        "left-headphone-core",
        "right-headphone-shell",
        "right-headphone-core",
        "microphone-boom",
        "microphone-tip",
    ],
    "helmet_support": [
        "helmet-lower-white-support-ring",
        "helmet-lower-white-left-cap",
        "helmet-lower-white-right-cap",
    ],
    "body": [
        "BodyCtrl",
        "soft-suit-body",
        "purple-front-yoke",
        "purple-neck-yoke",
        "soft-hip-bridge",
    ],
    "badge": [
        "ai-badge-recess-ring",
        "ai-badge-outer-bezel",
        "purple-ai-badge-ring",
        "ai-badge-glow-core",
        "AI-badge-text",
    ],
    "arms": [
        "LeftArmCtrl",
        "RightArmCtrl",
        "left-shoulder-socket",
        "right-shoulder-socket",
        "left-shoulder-flow",
        "right-shoulder-flow",
        "left-arm",
        "right-arm",
        "left-hand-mitt",
        "right-hand-mitt",
    ],
    "legs": [
        "LeftLegCtrl",
        "RightLegCtrl",
        "left-soft-leg",
        "right-soft-leg",
        "left-purple-boot",
        "right-purple-boot",
    ],
}


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def material(
    name: str,
    color: tuple[float, float, float, float],
    *,
    roughness: float = 0.35,
    metallic: float = 0.0,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = color
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = color[3]
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        if emission and "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission
        if emission and "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    mat.diffuse_color = color
    if color[3] < 1:
        mat.use_screen_refraction = True
        mat.blend_method = "BLEND"
        mat.show_transparent_back = True
    return mat


def image_material(name: str, image_path: Path) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.blend_method = "BLEND"
    mat.show_transparent_back = False
    mat.use_screen_refraction = True
    mat.diffuse_color = (1, 1, 1, 1)

    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    texture = nodes.new("ShaderNodeTexImage")
    texture.image = bpy.data.images.load(str(image_path))
    texture.extension = "CLIP"
    if bsdf:
        if "Base Color" in bsdf.inputs:
            mat.node_tree.links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
        if "Alpha" in bsdf.inputs:
            mat.node_tree.links.new(texture.outputs["Alpha"], bsdf.inputs["Alpha"])
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = 0.18
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (1, 1, 1, 1)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = 1.1
    return mat


def set_parent_keep_transform(obj: bpy.types.Object, parent: bpy.types.Object) -> None:
    obj.parent = parent
    obj.matrix_parent_inverse = parent.matrix_world.inverted()


def shade(obj: bpy.types.Object) -> bpy.types.Object:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    obj.select_set(False)
    return obj


def empty(name: str, location: tuple[float, float, float], parent: bpy.types.Object | None = None) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "SPHERE"
    obj.empty_display_size = 0.08
    obj.location = location
    bpy.context.collection.objects.link(obj)
    if parent:
        set_parent_keep_transform(obj, parent)
    return obj


def sphere(
    name: str,
    loc: tuple[float, float, float],
    scale: tuple[float, float, float],
    mat: bpy.types.Material,
    parent: bpy.types.Object,
    *,
    segments: int = 64,
    rings: int = 32,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=loc)
    obj = shade(bpy.context.object)
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    set_parent_keep_transform(obj, parent)
    return obj


def soft_revolved_mesh(
    name: str,
    profile: list[tuple[float, float, float]],
    mat: bpy.types.Material,
    parent: bpy.types.Object,
    *,
    center: tuple[float, float] = (0.0, 0.0),
    segments: int = 72,
) -> bpy.types.Object:
    vertices: list[tuple[float, float, float]] = []
    for z, radius_x, radius_y in profile:
        for step in range(segments):
            angle = math.tau * step / segments
            vertices.append((center[0] + math.cos(angle) * radius_x, center[1] + math.sin(angle) * radius_y, z))

    faces: list[tuple[int, ...]] = []
    for ring in range(len(profile) - 1):
        base = ring * segments
        next_base = (ring + 1) * segments
        for step in range(segments):
            faces.append((base + step, base + (step + 1) % segments, next_base + (step + 1) % segments, next_base + step))

    bottom_center = len(vertices)
    vertices.append((center[0], center[1], profile[0][0]))
    for step in range(segments):
        faces.append((bottom_center, (step + 1) % segments, step))

    top_center = len(vertices)
    vertices.append((center[0], center[1], profile[-1][0]))
    top_base = (len(profile) - 1) * segments
    for step in range(segments):
        faces.append((top_center, top_base + step, top_base + (step + 1) % segments))

    mesh = bpy.data.meshes.new(f"{name}-mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update(calc_edges=True)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    set_parent_keep_transform(obj, parent)
    shade(obj)
    return obj


def cylinder_between(
    name: str,
    start: tuple[float, float, float],
    end: tuple[float, float, float],
    radius: float,
    mat: bpy.types.Material,
    parent: bpy.types.Object,
    *,
    vertices: int = 48,
) -> bpy.types.Object:
    a = Vector(start)
    b = Vector(end)
    mid = (a + b) / 2
    direction = b - a
    length = direction.length
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=length, location=mid)
    obj = shade(bpy.context.object)
    obj.name = name
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    obj.data.materials.append(mat)
    set_parent_keep_transform(obj, parent)
    return obj


def torus(
    name: str,
    loc: tuple[float, float, float],
    major: float,
    minor: float,
    mat: bpy.types.Material,
    parent: bpy.types.Object,
    rotation: tuple[float, float, float] = (0, 0, 0),
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=96, minor_segments=12, location=loc, rotation=rotation)
    obj = shade(bpy.context.object)
    obj.name = name
    obj.data.materials.append(mat)
    set_parent_keep_transform(obj, parent)
    return obj


def curve_polyline(
    name: str,
    points: list[tuple[float, float, float]],
    mat: bpy.types.Material,
    parent: bpy.types.Object,
    *,
    bevel_depth: float,
) -> bpy.types.Object:
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 4
    curve.bevel_depth = bevel_depth
    curve.bevel_resolution = 5
    poly = curve.splines.new("POLY")
    poly.points.add(len(points) - 1)
    for point, co in zip(poly.points, points):
        point.co = (co[0], co[1], co[2], 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    set_parent_keep_transform(obj, parent)
    return obj


def arc_points(
    center: tuple[float, float, float],
    radius_x: float,
    radius_z: float,
    start_deg: float,
    end_deg: float,
    steps: int,
) -> list[tuple[float, float, float]]:
    points: list[tuple[float, float, float]] = []
    for step in range(steps + 1):
        t = start_deg + (end_deg - start_deg) * step / steps
        rad = math.radians(t)
        points.append((center[0] + math.cos(rad) * radius_x, center[1], center[2] + math.sin(rad) * radius_z))
    return points


def smooth_outline(points: list[tuple[float, float]], *, samples: int = 6) -> list[tuple[float, float]]:
    result: list[tuple[float, float]] = []
    count = len(points)
    for index in range(count):
        p0 = points[(index - 1) % count]
        p1 = points[index]
        p2 = points[(index + 1) % count]
        p3 = points[(index + 2) % count]
        for step in range(samples):
            t = step / samples
            t2 = t * t
            t3 = t2 * t
            x = 0.5 * (
                (2 * p1[0])
                + (-p0[0] + p2[0]) * t
                + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2
                + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
            )
            z = 0.5 * (
                (2 * p1[1])
                + (-p0[1] + p2[1]) * t
                + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2
                + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
            )
            result.append((x, z))
    return result


def shape_panel(
    name: str,
    outline: list[tuple[float, float]],
    y: float,
    mat: bpy.types.Material,
    parent: bpy.types.Object,
    *,
    center: tuple[float, float] = (0.0, 0.0),
) -> bpy.types.Object:
    vertices = [(center[0], y, center[1])] + [(x, y, z) for x, z in outline]
    faces = [(0, index, 1 + (index % len(outline))) for index in range(1, len(outline) + 1)]
    mesh = bpy.data.meshes.new(f"{name}-mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update(calc_edges=True)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    set_parent_keep_transform(obj, parent)
    return obj


def add_text(
    name: str,
    text: str,
    loc: tuple[float, float, float],
    size: float,
    mat: bpy.types.Material,
    parent: bpy.types.Object,
    rotation: tuple[float, float, float] = (math.radians(90), 0, 0),
) -> bpy.types.Object:
    bpy.ops.object.text_add(location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.body = text
    obj.data.align_x = "CENTER"
    obj.data.align_y = "CENTER"
    obj.data.size = size
    obj.data.extrude = 0.008
    obj.data.materials.append(mat)
    set_parent_keep_transform(obj, parent)
    return obj


def image_plane(
    name: str,
    image_path: Path,
    loc: tuple[float, float, float],
    width: float,
    parent: bpy.types.Object,
    rotation: tuple[float, float, float] = (math.radians(86), 0, 0),
) -> bpy.types.Object:
    image = bpy.data.images.load(str(image_path))
    aspect = image.size[1] / image.size[0]
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (width, width * aspect, 1)
    obj.data.materials.append(image_material(f"{name}-material", image_path))
    set_parent_keep_transform(obj, parent)
    return obj


def capsule(
    name: str,
    start: tuple[float, float, float],
    end: tuple[float, float, float],
    radius: float,
    mat: bpy.types.Material,
    parent: bpy.types.Object,
) -> None:
    cylinder_between(f"{name}-shaft", start, end, radius, mat, parent)
    sphere(f"{name}-cap-a", start, (radius, radius, radius), mat, parent, segments=32, rings=16)
    sphere(f"{name}-cap-b", end, (radius, radius, radius), mat, parent, segments=32, rings=16)


def build_model() -> None:
    clear_scene()

    purple = material("helmet-electric-violet", (0.09, 0.0, 0.95, 1.0), roughness=0.08, metallic=0.08)
    purple_mid = material("helmet-glossy-violet", (0.23, 0.0, 1.0, 1.0), roughness=0.1, metallic=0.05)
    purple_dark = material("deep-violet", (0.055, 0.01, 0.38, 1.0), roughness=0.16, metallic=0.08)
    glass = material("transparent-blue-violet-helmet", (0.30, 0.55, 1.0, 0.055), roughness=0.01, metallic=0.0)
    glass_edge = material("blue-glass-edge", (0.42, 0.76, 1.0, 0.58), roughness=0.02, metallic=0.0)
    white = material("pearl-white-suit", (0.985, 0.992, 1.0, 1.0), roughness=0.24, metallic=0.025)
    face = material("warm-pink-face", (1.0, 0.76, 0.88, 1.0), roughness=0.34, metallic=0.0)
    black = material("ink-black", (0.005, 0.008, 0.02, 1.0), roughness=0.18, metallic=0.0)
    cheek = material("pink-cheek", (1.0, 0.32, 0.68, 0.72), roughness=0.42, metallic=0.0)
    cyan = material(
        "cyan-emissive-lines",
        (0.06, 0.88, 1.0, 1.0),
        roughness=0.12,
        metallic=0.0,
        emission=(0.06, 0.88, 1.0, 1.0),
        emission_strength=1.6,
    )
    badge_glow = material(
        "ai-badge-core-glow",
        (0.45, 0.24, 1.0, 1.0),
        roughness=0.08,
        metallic=0.0,
        emission=(0.45, 0.24, 1.0, 1.0),
        emission_strength=1.4,
    )
    panel_line = material("soft-blue-panel-lines", (0.30, 0.48, 1.0, 1.0), roughness=0.18, metallic=0.0)
    highlight = material("gloss-white-highlight", (1.0, 1.0, 1.0, 0.62), roughness=0.05, metallic=0.0)

    root = empty("MascotRoot", (0, 0, 0))
    body_ctrl = empty("BodyCtrl", (0, 0, 0.86), root)
    head_ctrl = empty("HeadCtrl", (0, 0, 1.68), root)
    left_arm_ctrl = empty("LeftArmCtrl", (-0.40, -0.02, 1.03), root)
    right_arm_ctrl = empty("RightArmCtrl", (0.40, -0.02, 1.03), root)
    left_leg_ctrl = empty("LeftLegCtrl", (-0.17, 0, 0.55), root)
    right_leg_ctrl = empty("RightLegCtrl", (0.17, 0, 0.55), root)

    # Body and badge.
    sphere("soft-suit-body", (0, -0.01, 0.90), (0.43, 0.31, 0.51), white, body_ctrl, segments=64, rings=32)
    shape_panel("purple-front-yoke", [(-0.29, 1.20), (0.29, 1.20), (0.22, 1.08), (0.13, 0.99), (0.05, 0.93), (0, 0.91), (-0.05, 0.93), (-0.13, 0.99), (-0.22, 1.08)], -0.352, purple_dark, body_ctrl, center=(0, 1.04))
    sphere("purple-neck-yoke", (0, -0.02, 1.21), (0.40, 0.23, 0.105), purple_dark, body_ctrl)
    sphere("soft-hip-bridge", (0, -0.025, 0.56), (0.30, 0.18, 0.105), white, body_ctrl, segments=40, rings=16)
    sphere("left-shoulder-socket", (-0.39, -0.08, 1.04), (0.19, 0.13, 0.16), white, body_ctrl, segments=40, rings=18)
    sphere("right-shoulder-socket", (0.39, -0.08, 1.04), (0.19, 0.13, 0.16), white, body_ctrl, segments=40, rings=18)
    capsule("left-shoulder-flow", (-0.34, -0.08, 1.04), (-0.48, -0.10, 0.91), 0.125, white, body_ctrl)
    capsule("right-shoulder-flow", (0.34, -0.08, 1.04), (0.48, -0.10, 0.91), 0.125, white, body_ctrl)
    torus("ai-badge-recess-ring", (0, -0.343, 0.99), 0.190, 0.012, panel_line, body_ctrl, rotation=(math.radians(90), 0, 0))
    torus("ai-badge-outer-bezel", (0, -0.360, 0.99), 0.176, 0.026, purple_dark, body_ctrl, rotation=(math.radians(90), 0, 0))
    torus("purple-ai-badge-ring", (0, -0.382, 0.99), 0.145, 0.016, purple, body_ctrl, rotation=(math.radians(90), 0, 0))
    sphere("ai-badge-glow-core", (0, -0.397, 0.99), (0.126, 0.016, 0.126), badge_glow, body_ctrl)
    add_text("AI-badge-text", "AI", (0, -0.424, 0.99), 0.130, white, body_ctrl)

    # Head, helmet, face, headset and microphone.
    sphere("helmet-back-shell", (0, 0, 1.92), (0.87, 0.70, 0.77), purple, head_ctrl)
    sphere("helmet-front-violet-panel", (0, -0.78, 1.94), (0.70, 0.065, 0.49), purple, head_ctrl)
    face_control = [
        (-0.53, 1.91),
        (-0.51, 1.76),
        (-0.43, 1.63),
        (-0.27, 1.55),
        (0, 1.535),
        (0.27, 1.55),
        (0.43, 1.63),
        (0.51, 1.76),
        (0.53, 1.91),
        (0.46, 2.02),
        (0.32, 2.06),
        (0.15, 2.00),
        (0, 1.965),
        (-0.15, 2.00),
        (-0.32, 2.06),
        (-0.46, 2.02),
    ]
    face_outline = smooth_outline(face_control, samples=7)
    sphere("face-cushion-volume", (0, -0.935, 1.76), (0.58, 0.085, 0.38), face, head_ctrl, segments=64, rings=32)
    shape_panel("soft-face-panel", face_outline, -1.030, face, head_ctrl, center=(0, 1.78))
    sphere("transparent-glass-dome", (0, -0.12, 1.92), (0.90, 0.765, 0.775), glass, head_ctrl)
    lower_support_ring = [
        (-0.66, -0.980, 1.455),
        (-0.46, -1.015, 1.405),
        (-0.22, -1.035, 1.375),
        (0, -1.045, 1.365),
        (0.22, -1.035, 1.375),
        (0.46, -1.015, 1.405),
        (0.66, -0.980, 1.455),
    ]
    curve_polyline("helmet-lower-white-support-ring", lower_support_ring, white, head_ctrl, bevel_depth=0.044)
    sphere("helmet-lower-white-left-cap", (-0.66, -0.980, 1.455), (0.052, 0.052, 0.052), white, head_ctrl, segments=24, rings=12)
    sphere("helmet-lower-white-right-cap", (0.66, -0.980, 1.455), (0.052, 0.052, 0.052), white, head_ctrl, segments=24, rings=12)
    curve_polyline("glass-upper-white-highlight", arc_points((0, -1.02, 2.02), 0.66, 0.58, 62, 119, 20), highlight, head_ctrl, bevel_depth=0.019)
    curve_polyline("glass-right-white-highlight", arc_points((0, -1.024, 1.99), 0.70, 0.58, 31, 43, 8), highlight, head_ctrl, bevel_depth=0.014)
    for x in (-0.21, 0.21):
        sphere(f"eye-{x}", (x, -1.055, 1.84), (0.086, 0.018, 0.165), black, head_ctrl, segments=40, rings=18)
        sphere(f"eye-spark-{x}", (x + 0.038, -1.076, 1.93), (0.021, 0.006, 0.021), white, head_ctrl, segments=18, rings=10)
        sphere(f"eye-soft-reflect-{x}", (x + 0.014, -1.077, 1.875), (0.011, 0.004, 0.026), highlight, head_ctrl, segments=18, rings=10)
    sphere("left-cheek", (-0.38, -1.048, 1.68), (0.14, 0.012, 0.085), cheek, head_ctrl, segments=32, rings=16)
    sphere("right-cheek", (0.38, -1.048, 1.68), (0.14, 0.012, 0.085), cheek, head_ctrl, segments=32, rings=16)
    curve_polyline("smile-mouth", arc_points((0, -1.082, 1.72), 0.13, 0.095, 208, 332, 14), black, head_ctrl, bevel_depth=0.015)
    for side, x in (("left", -0.90), ("right", 0.90)):
        cylinder_between(f"{side}-headphone-shell", (x, -0.28, 1.86), (x + (0.17 if x < 0 else -0.17), -0.28, 1.86), 0.23, white, head_ctrl)
        cylinder_between(f"{side}-headphone-core", (x, -0.49, 1.86), (x + (0.105 if x < 0 else -0.105), -0.49, 1.86), 0.158, purple_mid, head_ctrl)
        cylinder_between(f"{side}-headphone-inner-ring", (x, -0.525, 1.86), (x + (0.060 if x < 0 else -0.060), -0.525, 1.86), 0.098, purple_dark, head_ctrl)
    curve_polyline("microphone-boom", [(0.80, -0.43, 1.78), (0.88, -0.58, 1.70), (0.62, -0.80, 1.65)], black, head_ctrl, bevel_depth=0.014)
    sphere("microphone-tip", (0.53, -0.79, 1.65), (0.095, 0.048, 0.048), black, head_ctrl, segments=24, rings=12)
    image_plane("helmet-wing-logo", LOGO_IMAGE, (0, -1.055, 2.19), 0.245, head_ctrl, rotation=(math.radians(84), 0, 0))

    # Limbs.
    capsule("left-arm", (-0.43, -0.06, 0.99), (-0.56, -0.10, 0.68), 0.142, white, left_arm_ctrl)
    sphere("left-hand-mitt", (-0.59, -0.12, 0.59), (0.182, 0.130, 0.158), white, left_arm_ctrl)
    capsule("right-arm", (0.43, -0.06, 0.99), (0.56, -0.10, 0.70), 0.142, white, right_arm_ctrl)
    sphere("right-hand-mitt", (0.59, -0.12, 0.61), (0.182, 0.130, 0.158), white, right_arm_ctrl)
    capsule("left-soft-leg", (-0.18, 0.00, 0.63), (-0.21, -0.02, 0.17), 0.168, white, left_leg_ctrl)
    capsule("right-soft-leg", (0.18, 0.00, 0.63), (0.21, -0.02, 0.17), 0.168, white, right_leg_ctrl)
    sphere("left-purple-boot", (-0.22, -0.12, 0.072), (0.265, 0.180, 0.092), purple, left_leg_ctrl)
    sphere("right-purple-boot", (0.22, -0.12, 0.072), (0.265, 0.180, 0.092), purple, right_leg_ctrl)

    # Lighting and camera for .blend previews; GLB export keeps the mesh/materials.
    bpy.ops.object.light_add(type="AREA", location=(0, -3.5, 4.5))
    light = bpy.context.object
    light.name = "softbox-key-light"
    light.data.energy = 450
    light.data.size = 5
    bpy.ops.object.camera_add(location=(0, -5.2, 1.65), rotation=(math.radians(78), 0, 0))
    bpy.context.scene.camera = bpy.context.object

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT),
        export_format="GLB",
        export_yup=True,
        export_apply=False,
        export_animations=False,
        use_visible=True,
    )


if __name__ == "__main__":
    build_model()
    print(f"Generated {OUTPUT}")
