import { FaceLandmarkerResult, NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface AttentionMetrics {
  faceDetected: boolean;
  attentionStatus: 'LOCKED' | 'DISTRACTED';
  eyeContact: 'MAINTAINED' | 'LOST';
  yawOffset: number; // -1 to 1 (0 = centered)
  pitchOffset: number; // -1 to 1 (0 = centered)
  confidence: number; // 0 to 100
  keyPoints?: {
    nose: { x: number; y: number };
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    leftIris?: { x: number; y: number };
    rightIris?: { x: number; y: number };
    chin: { x: number; y: number };
    forehead: { x: number; y: number };
    box: { minX: number; minY: number; maxX: number; maxY: number };
  };
}

export class AttentionDetector {
  private smoothingWindow: boolean[] = [];
  private readonly windowSize = 5;

  /**
   * Evaluates face landmarks to determine if user is looking at the screen
   */
  public evaluate(result: FaceLandmarkerResult | null): AttentionMetrics {
    if (!result || !result.faceLandmarks || result.faceLandmarks.length === 0) {
      // No face detected -> Distracted / Lost gaze
      this.pushHistory(false);
      return {
        faceDetected: false,
        attentionStatus: 'DISTRACTED',
        eyeContact: 'LOST',
        yawOffset: 0,
        pitchOffset: 0,
        confidence: 0,
      };
    }

    const landmarks = result.faceLandmarks[0];
    if (!landmarks || landmarks.length < 468) {
      this.pushHistory(false);
      return {
        faceDetected: true,
        attentionStatus: 'DISTRACTED',
        eyeContact: 'LOST',
        yawOffset: 0,
        pitchOffset: 0,
        confidence: 20,
      };
    }

    // Key Landmark indices
    const NOSE_TIP = 1;
    const FOREHEAD = 10;
    const CHIN = 152;
    const LEFT_CHEEK = 234;
    const RIGHT_CHEEK = 454;
    const LEFT_EYE_OUTER = 33;
    const LEFT_EYE_INNER = 133;
    const RIGHT_EYE_INNER = 362;
    const RIGHT_EYE_OUTER = 263;
    const LEFT_IRIS = 468;
    const RIGHT_IRIS = 473;

    const nose = landmarks[NOSE_TIP];
    const forehead = landmarks[FOREHEAD];
    const chin = landmarks[CHIN];
    const leftCheek = landmarks[LEFT_CHEEK];
    const rightCheek = landmarks[RIGHT_CHEEK];
    const leftEye = landmarks[LEFT_EYE_OUTER];
    const rightEye = landmarks[RIGHT_EYE_OUTER];

    // Compute Face Bounding Box
    let minX = 1,
      minY = 1,
      maxX = 0,
      maxY = 0;
    for (let i = 0; i < Math.min(landmarks.length, 468); i += 10) {
      const lm = landmarks[i];
      if (lm.x < minX) minX = lm.x;
      if (lm.x > maxX) maxX = lm.x;
      if (lm.y < minY) minY = lm.y;
      if (lm.y > maxY) maxY = lm.y;
    }

    // 1. Horizontal Head Rotation (Yaw)
    const midCheekX = (leftCheek.x + rightCheek.x) / 2;
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x) || 0.001;
    // Yaw ratio: ~0 when looking directly forward, positive if turned right, negative if turned left
    const rawYaw = (nose.x - midCheekX) / faceWidth;
    const isYawCentered = Math.abs(rawYaw) <= 0.14;

    // 2. Vertical Head Tilt (Pitch)
    const midEyeY = (leftEye.y + rightEye.y) / 2;
    const faceHeight = Math.abs(chin.y - forehead.y) || 0.001;
    const noseRelY = (nose.y - midEyeY) / faceHeight;
    // Normal noseRelY is around 0.35 - 0.45.
    const isPitchCentered = noseRelY >= 0.22 && noseRelY <= 0.52;

    // 3. Iris / Eye Gaze (if iris landmarks exist)
    let isIrisFacing = true;
    let leftIrisPoint: { x: number; y: number } | undefined;
    let rightIrisPoint: { x: number; y: number } | undefined;

    if (landmarks.length > RIGHT_IRIS) {
      const lIris = landmarks[LEFT_IRIS];
      const rIris = landmarks[RIGHT_IRIS];
      leftIrisPoint = { x: lIris.x, y: lIris.y };
      rightIrisPoint = { x: rIris.x, y: rIris.y };

      const leftEyeInner = landmarks[LEFT_EYE_INNER];
      const leftEyeOuter = landmarks[LEFT_EYE_OUTER];
      const leftEyeW = Math.abs(leftEyeInner.x - leftEyeOuter.x) || 0.001;
      const leftRatio = Math.abs(lIris.x - leftEyeOuter.x) / leftEyeW;

      // Center is around 0.40 - 0.65
      if (leftRatio < 0.28 || leftRatio > 0.72) {
        isIrisFacing = false;
      }
    }

    // Combined Raw Decision
    const isFacingDirectly = isYawCentered && isPitchCentered && isIrisFacing;
    this.pushHistory(isFacingDirectly);

    // Hysteresis / Smoothing: majority vote over last N frames to avoid blink jitter
    const positiveVotes = this.smoothingWindow.filter(Boolean).length;
    const isSmoothedLocked = positiveVotes >= Math.ceil(this.windowSize / 2);

    return {
      faceDetected: true,
      attentionStatus: isSmoothedLocked ? 'LOCKED' : 'DISTRACTED',
      eyeContact: isSmoothedLocked ? 'MAINTAINED' : 'LOST',
      yawOffset: Number(rawYaw.toFixed(3)),
      pitchOffset: Number((noseRelY - 0.38).toFixed(3)),
      confidence: Math.round(
        Math.max(
          10,
          Math.min(
            99,
            (1 - Math.min(1, Math.abs(rawYaw) * 3)) * 60 +
              (1 - Math.min(1, Math.abs(noseRelY - 0.38) * 3)) * 40
          )
        )
      ),
      keyPoints: {
        nose: { x: nose.x, y: nose.y },
        leftEye: { x: leftEye.x, y: leftEye.y },
        rightEye: { x: rightEye.x, y: rightEye.y },
        leftIris: leftIrisPoint,
        rightIris: rightIrisPoint,
        chin: { x: chin.x, y: chin.y },
        forehead: { x: forehead.x, y: forehead.y },
        box: { minX, minY, maxX, maxY },
      },
    };
  }

  private pushHistory(val: boolean) {
    this.smoothingWindow.push(val);
    if (this.smoothingWindow.length > this.windowSize) {
      this.smoothingWindow.shift();
    }
  }

  public reset() {
    this.smoothingWindow = [];
  }
}
