import * as THREE from 'three';
import type { Stone, RakeStroke } from '../stores/useGardenStore';

/**
 * PatternSystem - 젠가든 패턴 생성의 핵심 시스템
 *
 * 핵심 철학:
 * - 사몬(砂紋): 갈퀴로 그은 직선/곡선 패턴
 * - 미즈몬(水紋): 돌 주위의 동심원 패턴 (물에 떨어진 돌처럼)
 *
 * 젠가든 패턴의 특징:
 * - 갈퀴질이 돌 근처를 지나갈 때 동심원으로 자연스럽게 휘어짐
 * - 직선 패턴이 돌을 감싸듯 흐름
 */

// 텍스처 해상도
export const TEXTURE_SIZE = 1024;
export const GARDEN_SIZE = 10; // 정원 크기 (-5 ~ 5)

/**
 * Catmull-Rom Spline - 부드러운 곡선 생성
 * 모든 점을 정확히 지나가는 부드러운 곡선
 */
function catmullRomSpline(
  p0: THREE.Vector2,
  p1: THREE.Vector2,
  p2: THREE.Vector2,
  p3: THREE.Vector2,
  t: number,
  tension: number = 0.5
): THREE.Vector2 {
  const t2 = t * t;
  const t3 = t2 * t;

  const v0 = (p2.x - p0.x) * tension;
  const v1 = (p3.x - p1.x) * tension;
  const w0 = (p2.y - p0.y) * tension;
  const w1 = (p3.y - p1.y) * tension;

  const x =
    (2 * p1.x - 2 * p2.x + v0 + v1) * t3 +
    (-3 * p1.x + 3 * p2.x - 2 * v0 - v1) * t2 +
    v0 * t +
    p1.x;

  const y =
    (2 * p1.y - 2 * p2.y + w0 + w1) * t3 +
    (-3 * p1.y + 3 * p2.y - 2 * w0 - w1) * t2 +
    w0 * t +
    p1.y;

  return new THREE.Vector2(x, y);
}

/**
 * 포인트 간격 줄이기 (Douglas-Peucker 간소화)
 * 너무 촘촘한 점들을 제거하여 부드러운 곡선이 잘 작동하도록
 */
function simplifyPoints(
  points: THREE.Vector2[],
  minDistance: number = 0.15
): THREE.Vector2[] {
  if (points.length < 3) return points;

  const simplified: THREE.Vector2[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const lastPoint = simplified[simplified.length - 1];
    const dist = lastPoint.distanceTo(points[i]);

    if (dist >= minDistance) {
      simplified.push(points[i]);
    }
  }

  // 마지막 점은 항상 추가
  simplified.push(points[points.length - 1]);

  return simplified;
}

/**
 * 포인트 배열을 부드러운 곡선으로 변환
 */
export function smoothPoints(
  points: THREE.Vector2[],
  segments: number = 16
): THREE.Vector2[] {
  if (points.length < 2) return points;
  if (points.length === 2) return points;

  // 1단계: 너무 촘촘한 점들 제거
  const simplified = simplifyPoints(points, 0.12);

  if (simplified.length < 3) return simplified;

  const smoothed: THREE.Vector2[] = [];

  // 첫 점 추가
  smoothed.push(simplified[0]);

  // 중간 점들을 Catmull-Rom으로 보간
  for (let i = 0; i < simplified.length - 1; i++) {
    const p0 = simplified[Math.max(0, i - 1)];
    const p1 = simplified[i];
    const p2 = simplified[i + 1];
    const p3 = simplified[Math.min(simplified.length - 1, i + 2)];

    for (let t = 0; t < 1; t += 1 / segments) {
      const point = catmullRomSpline(p0, p1, p2, p3, t);
      smoothed.push(point);
    }
  }

  // 마지막 점 추가
  smoothed.push(simplified[simplified.length - 1]);

  return smoothed;
}

/**
 * 월드 좌표를 텍스처 좌표로 변환
 */
export function worldToTexture(x: number, z: number): [number, number] {
  const u = ((x + GARDEN_SIZE / 2) / GARDEN_SIZE) * TEXTURE_SIZE;
  const v = ((z + GARDEN_SIZE / 2) / GARDEN_SIZE) * TEXTURE_SIZE;
  return [Math.floor(u), Math.floor(v)];
}

/**
 * 텍스처 좌표를 월드 좌표로 변환
 */
export function textureToWorld(u: number, v: number): [number, number] {
  const x = (u / TEXTURE_SIZE) * GARDEN_SIZE - GARDEN_SIZE / 2;
  const z = (v / TEXTURE_SIZE) * GARDEN_SIZE - GARDEN_SIZE / 2;
  return [x, z];
}

/**
 * 점이 돌에 의해 휘어지는 정도 계산
 * 돌 근처일수록 동심원 방향으로 점이 이동
 */
function deflectPointByStones(
  x: number,
  y: number,
  stones: Stone[],
  offset: number
): [number, number] {
  let totalDeflectX = 0;
  let totalDeflectY = 0;
  let totalInfluence = 0;

  for (const stone of stones) {
    const dx = x - stone.position[0];
    const dy = y - stone.position[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 돌의 영향 범위 (반지름의 3배)
    const influenceRadius = stone.radius * 3;

    if (distance < influenceRadius && distance > stone.radius) {
      // 영향력 계산 (가까울수록 강함)
      const influence = 1 - (distance - stone.radius) / (influenceRadius - stone.radius);
      const smoothInfluence = influence * influence; // 부드러운 곡선

      // 동심원 방향의 접선 벡터
      const normalX = dx / distance;
      const normalY = dy / distance;

      // 접선 방향 (90도 회전)
      const tangentX = -normalY;
      const tangentY = normalX;

      // offset 방향에 따라 바깥쪽 또는 안쪽으로 휘어짐
      const deflectAmount = offset * smoothInfluence * 0.8;

      totalDeflectX +=
        tangentX * deflectAmount + normalX * Math.abs(offset) * smoothInfluence * 0.3;
      totalDeflectY +=
        tangentY * deflectAmount + normalY * Math.abs(offset) * smoothInfluence * 0.3;
      totalInfluence += smoothInfluence;
    }
  }

  if (totalInfluence > 0) {
    return [x + totalDeflectX / totalInfluence, y + totalDeflectY / totalInfluence];
  }

  return [x, y];
}

/**
 * 점이 돌 내부에 있는지 확인
 */
function isPointInsideStone(x: number, y: number, stones: Stone[]): boolean {
  for (const stone of stones) {
    const dx = x - stone.position[0];
    const dy = y - stone.position[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    // 돌 반지름보다 작으면 내부
    if (distance < stone.radius) {
      return true;
    }
  }
  return false;
}

/**
 * 갈퀴 획을 텍스처에 그리기 (돌 주위 휘어짐 적용)
 * @param stones 현재 돌 위치가 아닌, stroke에 저장된 스냅샷 사용
 */
export function drawRakeStroke(
  ctx: CanvasRenderingContext2D,
  stroke: RakeStroke,
  stones: Stone[], // 이제 사용 안함 (stroke.stonesSnapshot 사용)
  numTeeth: number = 5
): void {
  if (stroke.points.length < 2) return;

  const toothSpacing = 0.08; // 월드 단위 이빨 간격
  const lineWidth = 3;

  ctx.save();
  ctx.globalAlpha = stroke.opacity * 0.7;
  ctx.strokeStyle = '#8b7355';
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 그릴 당시의 돌 위치 사용 (스냅샷)
  const stonesAtDrawTime = stroke.stonesSnapshot || stones;

  // 부드러운 곡선으로 변환 (Catmull-Rom Spline)
  const smoothedPoints = smoothPoints(stroke.points, 16);

  // 각 이빨에 대해 평행선 그리기
  for (let t = 0; t < numTeeth; t++) {
    const offset = (t - (numTeeth - 1) / 2) * toothSpacing;

    ctx.beginPath();
    let pathStarted = false;

    for (let i = 0; i < smoothedPoints.length; i++) {
      const point = smoothedPoints[i];

      // 선의 방향에 수직으로 기본 오프셋 계산
      let perpX = 0,
        perpY = 0;

      if (i < smoothedPoints.length - 1) {
        const next = smoothedPoints[i + 1];
        const dx = next.x - point.x;
        const dy = next.y - point.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          perpX = -dy / len;
          perpY = dx / len;
        }
      } else if (i > 0) {
        const prev = smoothedPoints[i - 1];
        const dx = point.x - prev.x;
        const dy = point.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          perpX = -dy / len;
          perpY = dx / len;
        }
      }

      // 기본 오프셋 적용
      let worldX = point.x + perpX * offset;
      let worldY = point.y + perpY * offset;

      // 돌에 의한 휘어짐 적용 (스냅샷 위치 기준)
      [worldX, worldY] = deflectPointByStones(worldX, worldY, stonesAtDrawTime, offset);

      // 돌 내부에 있으면 스킵 (스냅샷 위치 기준)
      if (isPointInsideStone(worldX, worldY, stonesAtDrawTime)) {
        // 현재 경로가 있으면 그리고 새로 시작
        if (pathStarted) {
          ctx.stroke();
          ctx.beginPath();
          pathStarted = false;
        }
        continue;
      }

      const [texX, texY] = worldToTexture(worldX, worldY);

      if (!pathStarted) {
        ctx.moveTo(texX, texY);
        pathStarted = true;
      } else {
        ctx.lineTo(texX, texY);
      }
    }

    if (pathStarted) {
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * 현재 그리고 있는 획 미리보기
 */
export function drawCurrentStroke(
  ctx: CanvasRenderingContext2D,
  points: THREE.Vector2[],
  stones: Stone[],
  numTeeth: number = 5
): void {
  if (points.length < 2) return;

  const tempStroke: RakeStroke = {
    id: 'preview',
    points,
    timestamp: Date.now(),
    opacity: 0.5,
    stonesSnapshot: stones, // 현재 그리는 중이므로 현재 돌 위치 사용
  };

  drawRakeStroke(ctx, tempStroke, stones, numTeeth);
}

// 미즈몬(동심원) 기능 제거됨
// 사용자가 직접 돌 주위에 패턴을 그리도록 함

/**
 * 전체 패턴 텍스처 렌더링
 * @param baseTextureData 미리 생성된 기본 모래 텍스처 (노이즈 깜빡임 방지)
 */
export function renderPatternTexture(
  ctx: CanvasRenderingContext2D,
  stones: Stone[],
  strokes: RakeStroke[],
  currentPoints: THREE.Vector2[],
  baseTextureData: ImageData
): void {
  // 1. 기본 모래 텍스처 복원 (랜덤 노이즈 재생성 방지)
  ctx.putImageData(baseTextureData, 0, 0);

  // 2. 완료된 갈퀴 획들 (그릴 당시 돌 위치 기준으로 렌더링)
  for (const stroke of strokes) {
    drawRakeStroke(ctx, stroke, stones);
  }

  // 3. 현재 그리고 있는 획 (현재 돌 위치 기준)
  if (currentPoints.length >= 2) {
    drawCurrentStroke(ctx, currentPoints, stones);
  }
}
