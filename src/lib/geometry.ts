import { Point, Rect, Transform } from '@shared/types';

export function screenToWorld(screenPoint: Point, viewport: { zoom: number; panX: number; panY: number }): Point {
  return {
    x: (screenPoint.x - viewport.panX) / viewport.zoom,
    y: (screenPoint.y - viewport.panY) / viewport.zoom,
  };
}

export function worldToScreen(worldPoint: Point, viewport: { zoom: number; panX: number; panY: number }): Point {
  return {
    x: worldPoint.x * viewport.zoom + viewport.panX,
    y: worldPoint.y * viewport.zoom + viewport.panY,
  };
}

export function transformToRect(transform: Transform): Rect {
  return {
    x: transform.x,
    y: transform.y,
    width: transform.width,
    height: transform.height,
  };
}

export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function rectContainsRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const rad = degToRad(angle);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}
