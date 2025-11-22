/**
 * AudioSystem - 모래 긁는 소리 생성
 *
 * Web Audio API를 사용하여 부드러운 모래 긁는 소리를 실시간 합성
 */

let audioContext: AudioContext | null = null;
let noiseNode: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let isPlaying = false;
let noiseBuffer: AudioBuffer | null = null;

/**
 * AudioContext 초기화 (사용자 인터랙션 후 호출 필요)
 */
export function initAudio(): void {
  if (!audioContext) {
    audioContext = new AudioContext();
    // 노이즈 버퍼 미리 생성
    noiseBuffer = createNoiseBuffer(audioContext, 2);
  }
}

/**
 * 부드러운 노이즈 버퍼 생성 (한 번만)
 */
function createNoiseBuffer(
  context: AudioContext,
  duration: number
): AudioBuffer {
  const sampleRate = context.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = context.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // 부드러운 브라운 노이즈 생성
  let lastOut = 0;
  for (let i = 0; i < frameCount; i++) {
    const white = Math.random() * 2 - 1;
    // 브라운 노이즈 (더 부드럽고 자연스러운 소리)
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 2.5;
  }

  return buffer;
}

/**
 * 모래 긁는 소리 재생
 */
export function playRakingSound(): void {
  if (!audioContext || !noiseBuffer || isPlaying) return;

  try {
    isPlaying = true;

    // 노이즈 소스
    noiseNode = audioContext.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    // 밴드패스 필터 (모래 소리 주파수 대역: 800-2500Hz)
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1500;
    bandpass.Q.value = 0.3;

    // 하이패스 필터 (저음 완전 제거)
    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 600;

    // 볼륨
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0;

    // 연결
    noiseNode.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 재생 시작 (페이드인)
    noiseNode.start();
    gainNode.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.1);
  } catch (error) {
    console.warn('Failed to play raking sound:', error);
    isPlaying = false;
  }
}

/**
 * 소리 정지 (페이드아웃)
 */
export function stopRakingSound(): void {
  if (!audioContext || !isPlaying) {
    isPlaying = false;
    return;
  }

  try {
    if (gainNode) {
      // 부드러운 페이드아웃
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
    }

    // 페이드아웃 후 정리
    const currentNoiseNode = noiseNode;
    setTimeout(() => {
      try {
        currentNoiseNode?.stop();
      } catch {
        // 이미 정지됨
      }
    }, 150);
  } catch (error) {
    console.warn('Failed to stop raking sound:', error);
  }

  noiseNode = null;
  gainNode = null;
  isPlaying = false;
}

/**
 * 돌 놓는 소리
 */
export function playStonePlaceSound(): void {
  if (!audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      50,
      audioContext.currentTime + 0.2
    );

    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.2
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.warn('Failed to play stone sound:', error);
  }
}
