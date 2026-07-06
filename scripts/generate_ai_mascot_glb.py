"""
更新时间: 2026-07-06 12:25:44 CST
更新内容: 依据 imagegen 精修参考重建 AI 小人材质、比例和头盔细节，并将福客 logo 固定到头盔正面中轴上方的安全可视位置。
"""
from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "cockpit" / "public" / "models" / "ai-mascot.glb"
LOGO_IMAGE = ROOT / "logo.png"


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

    purple = material("helmet-electric-violet", (0.24, 0.06, 1.0, 1.0), roughness=0.14, metallic=0.06)
    purple_mid = material("helmet-glossy-violet", (0.44, 0.22, 1.0, 1.0), roughness=0.16, metallic=0.04)
    purple_dark = material("deep-violet", (0.08, 0.02, 0.46, 1.0), roughness=0.2, metallic=0.08)
    glass = material("transparent-blue-violet-helmet", (0.52, 0.70, 1.0, 0.22), roughness=0.02, metallic=0.0)
    glass_edge = material("blue-glass-edge", (0.48, 0.78, 1.0, 0.42), roughness=0.03, metallic=0.0)
    white = material("pearl-white-suit", (0.985, 0.992, 1.0, 1.0), roughness=0.24, metallic=0.025)
    face = material("warm-pink-face", (1.0, 0.80, 0.92, 1.0), roughness=0.36, metallic=0.0)
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
    panel_line = material("soft-blue-panel-lines", (0.30, 0.48, 1.0, 1.0), roughness=0.18, metallic=0.0)
    highlight = material("gloss-white-highlight", (1.0, 1.0, 1.0, 0.62), roughness=0.05, metallic=0.0)

    root = empty("MascotRoot", (0, 0, 0))
    body_ctrl = empty("BodyCtrl", (0, 0, 0.94), root)
    head_ctrl = empty("HeadCtrl", (0, 0, 1.68), root)
    left_arm_ctrl = empty("LeftArmCtrl", (-0.42, -0.02, 1.16), root)
    right_arm_ctrl = empty("RightArmCtrl", (0.42, -0.02, 1.16), root)
    left_leg_ctrl = empty("LeftLegCtrl", (-0.19, 0, 0.66), root)
    right_leg_ctrl = empty("RightLegCtrl", (0.19, 0, 0.66), root)

    # Body and badge.
    sphere("white-rounded-body", (0, 0, 0.92), (0.48, 0.32, 0.53), white, body_ctrl)
    sphere("purple-neck-yoke", (0, -0.02, 1.24), (0.44, 0.25, 0.16), purple_dark, body_ctrl)
    sphere("left-purple-shoulder-panel", (-0.33, -0.30, 1.16), (0.12, 0.025, 0.07), purple_mid, body_ctrl, segments=32, rings=16)
    sphere("right-purple-shoulder-panel", (0.33, -0.30, 1.16), (0.12, 0.025, 0.07), purple_mid, body_ctrl, segments=32, rings=16)
    torus("purple-ai-badge-ring", (0, -0.355, 1.03), 0.18, 0.025, purple, body_ctrl, rotation=(math.radians(90), 0, 0))
    sphere("purple-ai-badge-fill", (0, -0.367, 1.03), (0.165, 0.026, 0.165), purple_mid, body_ctrl)
    add_text("AI-badge-text", "AI", (0, -0.397, 1.03), 0.165, white, body_ctrl)
    curve_polyline("left-chest-panel-line", [(-0.35, -0.372, 1.10), (-0.27, -0.382, 1.17), (-0.18, -0.382, 1.18)], panel_line, body_ctrl, bevel_depth=0.006)
    curve_polyline("right-chest-panel-line", [(0.35, -0.372, 1.10), (0.27, -0.382, 1.17), (0.18, -0.382, 1.18)], panel_line, body_ctrl, bevel_depth=0.006)
    for x in (-0.27, 0.27):
        cylinder_between(f"chest-cyan-line-{x}", (x, -0.39, 1.14), (x * 0.72, -0.40, 1.02), 0.009, cyan, body_ctrl, vertices=16)
    cylinder_between("left-thigh-cyan-line", (-0.25, -0.245, 0.55), (-0.10, -0.255, 0.55), 0.011, cyan, body_ctrl, vertices=16)
    cylinder_between("right-thigh-cyan-line", (0.10, -0.255, 0.55), (0.25, -0.245, 0.55), 0.011, cyan, body_ctrl, vertices=16)
    curve_polyline("lower-suit-panel-left", [(-0.23, -0.33, 0.80), (-0.16, -0.36, 0.70), (-0.10, -0.36, 0.62)], panel_line, body_ctrl, bevel_depth=0.005)
    curve_polyline("lower-suit-panel-right", [(0.23, -0.33, 0.80), (0.16, -0.36, 0.70), (0.10, -0.36, 0.62)], panel_line, body_ctrl, bevel_depth=0.005)

    # Head, helmet, face, headset and microphone.
    sphere("helmet-back-shell", (0, 0, 1.86), (0.80, 0.61, 0.60), purple, head_ctrl)
    sphere("helmet-front-violet-panel", (0, -0.74, 1.94), (0.64, 0.05, 0.34), purple_mid, head_ctrl)
    sphere("helmet-logo-centered-purple-panel", (0, -0.93, 2.18), (0.24, 0.023, 0.105), purple, head_ctrl, segments=48, rings=20)
    sphere("soft-face-panel", (0, -0.82, 1.82), (0.51, 0.065, 0.34), face, head_ctrl)
    sphere("transparent-glass-dome", (0, -0.10, 1.88), (0.84, 0.72, 0.63), glass, head_ctrl)
    curve_polyline(
        "purple-visor-brow",
        [(-0.52, -0.93, 2.03), (-0.38, -0.955, 2.10), (-0.18, -0.965, 2.09), (0, -0.965, 2.04), (0.18, -0.965, 2.09), (0.38, -0.955, 2.10), (0.52, -0.93, 2.03)],
        purple_dark,
        head_ctrl,
        bevel_depth=0.03,
    )
    curve_polyline("visor-brow-front-highlight", [(-0.43, -0.972, 2.08), (-0.20, -0.982, 2.12), (0, -0.982, 2.09), (0.20, -0.982, 2.12), (0.43, -0.972, 2.08)], highlight, head_ctrl, bevel_depth=0.007)
    curve_polyline("white-helmet-front-rim", [(-0.64, -0.88, 1.53), (-0.30, -0.93, 1.49), (0, -0.95, 1.48), (0.30, -0.93, 1.49), (0.64, -0.88, 1.53)], white, head_ctrl, bevel_depth=0.044)
    curve_polyline("blue-glass-front-rim", arc_points((0, -0.965, 1.88), 0.74, 0.50, 198, 342, 24), glass_edge, head_ctrl, bevel_depth=0.012)
    curve_polyline("glass-upper-white-highlight", arc_points((0, -0.955, 1.92), 0.58, 0.44, 60, 122, 16), highlight, head_ctrl, bevel_depth=0.018)
    curve_polyline("glass-left-side-highlight", arc_points((0, -0.96, 1.90), 0.68, 0.50, 130, 166, 10), highlight, head_ctrl, bevel_depth=0.012)
    curve_polyline("helmet-lower-violet-edge", [(-0.58, -0.955, 1.56), (-0.28, -0.975, 1.53), (0, -0.982, 1.52), (0.28, -0.975, 1.53), (0.58, -0.955, 1.56)], purple_dark, head_ctrl, bevel_depth=0.012)
    for x in (-0.21, 0.21):
        sphere(f"eye-{x}", (x, -0.905, 1.84), (0.072, 0.018, 0.145), black, head_ctrl, segments=40, rings=18)
        sphere(f"eye-spark-{x}", (x + 0.032, -0.928, 1.92), (0.018, 0.006, 0.018), white, head_ctrl, segments=18, rings=10)
        sphere(f"eye-soft-reflect-{x}", (x + 0.012, -0.929, 1.875), (0.010, 0.004, 0.024), highlight, head_ctrl, segments=18, rings=10)
    sphere("left-cheek", (-0.37, -0.895, 1.70), (0.125, 0.012, 0.078), cheek, head_ctrl, segments=32, rings=16)
    sphere("right-cheek", (0.37, -0.895, 1.70), (0.125, 0.012, 0.078), cheek, head_ctrl, segments=32, rings=16)
    curve_polyline("smile-mouth", arc_points((0, -0.94, 1.77), 0.13, 0.10, 208, 332, 14), black, head_ctrl, bevel_depth=0.015)
    for side, x in (("left", -0.75), ("right", 0.75)):
        cylinder_between(f"{side}-headphone-shell", (x, -0.10, 1.86), (x + (0.14 if x < 0 else -0.14), -0.10, 1.86), 0.19, white, head_ctrl)
        cylinder_between(f"{side}-headphone-core", (x, -0.205, 1.86), (x + (0.09 if x < 0 else -0.09), -0.205, 1.86), 0.13, purple_mid, head_ctrl)
        cylinder_between(f"{side}-headphone-inner-ring", (x, -0.222, 1.86), (x + (0.05 if x < 0 else -0.05), -0.222, 1.86), 0.085, purple_dark, head_ctrl)
    curve_polyline("microphone-boom", [(0.66, -0.24, 1.80), (0.80, -0.50, 1.70), (0.60, -0.75, 1.66)], black, head_ctrl, bevel_depth=0.014)
    sphere("microphone-tip", (0.53, -0.77, 1.66), (0.092, 0.047, 0.047), black, head_ctrl, segments=24, rings=12)
    image_plane("helmet-wing-logo", LOGO_IMAGE, (0, -1.02, 2.18), 0.20, head_ctrl, rotation=(math.radians(84), 0, 0))

    # Limbs.
    capsule("left-arm", (-0.42, -0.02, 1.13), (-0.66, -0.06, 0.74), 0.122, white, left_arm_ctrl)
    cylinder_between("left-arm-cyan-band", (-0.48, -0.16, 1.02), (-0.57, -0.18, 0.91), 0.012, cyan, left_arm_ctrl, vertices=16)
    torus("left-purple-cuff", (-0.61, -0.07, 0.86), 0.112, 0.028, purple, left_arm_ctrl, rotation=(math.radians(82), 0, math.radians(-18)))
    sphere("left-hand-mitt", (-0.66, -0.08, 0.68), (0.145, 0.108, 0.135), white, left_arm_ctrl)
    capsule("right-arm", (0.42, -0.02, 1.13), (0.66, -0.06, 0.76), 0.122, white, right_arm_ctrl)
    cylinder_between("right-arm-cyan-band", (0.48, -0.16, 1.02), (0.57, -0.18, 0.92), 0.012, cyan, right_arm_ctrl, vertices=16)
    torus("right-purple-cuff", (0.61, -0.07, 0.88), 0.112, 0.028, purple, right_arm_ctrl, rotation=(math.radians(82), 0, math.radians(18)))
    sphere("right-hand-mitt", (0.67, -0.08, 0.70), (0.145, 0.108, 0.135), white, right_arm_ctrl)
    capsule("left-leg", (-0.21, 0.02, 0.70), (-0.25, -0.02, 0.20), 0.152, white, left_leg_ctrl)
    capsule("right-leg", (0.21, 0.02, 0.70), (0.25, -0.02, 0.20), 0.152, white, right_leg_ctrl)
    sphere("left-purple-boot", (-0.26, -0.10, 0.12), (0.205, 0.145, 0.08), purple, left_leg_ctrl)
    sphere("right-purple-boot", (0.26, -0.10, 0.12), (0.205, 0.145, 0.08), purple, right_leg_ctrl)
    sphere("left-boot-highlight", (-0.30, -0.195, 0.15), (0.08, 0.012, 0.018), highlight, left_leg_ctrl, segments=16, rings=8)
    sphere("right-boot-highlight", (0.22, -0.195, 0.15), (0.08, 0.012, 0.018), highlight, right_leg_ctrl, segments=16, rings=8)

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
