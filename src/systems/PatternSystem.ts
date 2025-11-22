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
      const influence =
        1 - (distance - stone.radius) / (influenceRadius - stone.radius);
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
        tangentX * deflectAmount +
        normalX * Math.abs(offset) * smoothInfluence * 0.3;
      totalDeflectY +=
        tangentY * deflectAmount +
        normalY * Math.abs(offset) * smoothInfluence * 0.3;
      totalInfluence += smoothInfluence;
    }
  }

  if (totalInfluence > 0) {
    return [
      x + totalDeflectX / totalInfluence,
      y + totalDeflectY / totalInfluence,
    ];
  }

  return [x, y];
}

/**
 * 갈퀴 획을 텍스처에 그리기 (돌 주위 휘어짐 적용)
 */
export function drawRakeStroke(
  ctx: CanvasRenderingContext2D,
  stroke: RakeStroke,
  stones: Stone[],
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

  // 각 이빨에 대해 평행선 그리기
  for (let t = 0; t < numTeeth; t++) {
    const offset = (t - (numTeeth - 1) / 2) * toothSpacing;

    ctx.beginPath();

    for (let i = 0; i < stroke.points.length; i++) {
      const point = stroke.points[i];

      // 선의 방향에 수직으로 기본 오프셋 계산
      let perpX = 0,
        perpY = 0;

      if (i < stroke.points.length - 1) {
        const next = stroke.points[i + 1];
        const dx = next.x - point.x;
        const dy = next.y - point.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          perpX = -dy / len;
          perpY = dx / len;
        }
      } else if (i > 0) {
        const prev = stroke.points[i - 1];
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

      // 돌에 의한 휘어짐 적용
      [worldX, worldY] = deflectPointByStones(worldX, worldY, stones, offset);

      const [texX, texY] = worldToTexture(worldX, worldY);

      if (i === 0) {
        ctx.moveTo(texX, texY);
      } else {
        ctx.lineTo(texX, texY);
      }
    }

    ctx.stroke();
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
  };

  drawRakeStroke(ctx, tempStroke, stones, numTeeth);
}

/**
 * 미즈몬(水紋) - 돌 주위 동심원 패턴
 * 갈퀴질이 없는 돌 주위에만 표시
 */
export function drawMizumon(
  ctx: CanvasRenderingContext2D,
  stone: Stone,
  hasNearbyStrokes: boolean,
  numRings: number = 4
): void {
  const [centerX, centerY] = worldToTexture(
    stone.position[0],
    stone.position[1]
  );
  const baseRadius = stone.radius * (TEXTURE_SIZE / GARDEN_SIZE);
  const ringSpacing = 15;

  ctx.save();
  ctx.strokeStyle = '#8b7355';
  ctx.lineWidth = 2.5;

  // 근처에 갈퀴 자국이 있으면 미즈몬을 약하게 표시
  const baseAlpha = hasNearbyStrokes ? 0.3 : 0.6;

  for (let i = 1; i <= numRings; i++) {
    const radius = baseRadius + i * ringSpacing;
    const alpha = baseAlpha - (i / numRings) * (baseAlpha * 0.5);

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 돌 근처에 갈퀴 자국이 있는지 확인
 */
function hasStrokesNearStone(
  stone: Stone,
  strokes: RakeStroke[],
  currentPoints: THREE.Vector2[]
): boolean {
  const checkRadius = stone.radius * 3;

  const allPoints = [...strokes.flatMap((s) => s.points), ...currentPoints];

  for (const point of allPoints) {
    const dx = point.x - stone.position[0];
    const dy = point.y - stone.position[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < checkRadius) {
      return true;
    }
  }

  return false;
}

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

  // 2. 돌 주위 동심원 (미즈몬) - 갈퀴 획 아래에 먼저 그림
  for (const stone of stones) {
    const hasNearby = hasStrokesNearStone(stone, strokes, currentPoints);
    drawMizumon(ctx, stone, hasNearby);
  }

  // 3. 완료된 갈퀴 획들 (돌 주위 휘어짐 적용)
  for (const stroke of strokes) {
    drawRakeStroke(ctx, stroke, stones);
  }

  // 4. 현재 그리고 있는 획
  if (currentPoints.length >= 2) {
    drawCurrentStroke(ctx, currentPoints, stones);
  }
}
