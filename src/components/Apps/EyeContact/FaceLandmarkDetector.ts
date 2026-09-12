import { FilesetResolver, FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export type DetectorStatus = 'uninitialized' | 'loading' | 'ready' | 'error';

export interface FaceLandmarkDetectorState {
  status: DetectorStatus;
  errorMessage: string | null;
  landmarker: FaceLandmarker | null;
}

class FaceLandmarkDetectorService {
  private landmarker: FaceLandmarker | null = null;
  private status: DetectorStatus = 'uninitialized';
  private errorMessage: string | null = null;
  private initPromise: Promise<FaceLandmarker | null> | null = null;

  public async initialize(): Promise<FaceLandmarker | null> {
    if (this.landmarker && this.status === 'ready') {
      return this.landmarker;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.status = 'loading';
    this.errorMessage = null;

    this.initPromise = (async () => {
      try {
        // Load WASM files from jsdelivr CDN
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        // Initialize FaceLandmarker with standard float16 task bundle
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        this.landmarker = landmarker;
        this.status = 'ready';
        return landmarker;
      } catch (err: unknown) {
        console.warn('MediaPipe FaceLandmarker initialization failed:', err);
        this.status = 'error';
        this.errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load MediaPipe vision bundle. Fallback estimation active.';
        return null;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  public detect(video: HTMLVideoElement, timestamp: number): FaceLandmarkerResult | null {
    if (!this.landmarker || this.status !== 'ready' || video.readyState < 2) {
      return null;
    }
    try {
      return this.landmarker.detectForVideo(video, timestamp);
    } catch (e) {
      console.warn('detectForVideo frame skipped:', e);
      return null;
    }
  }

  public getStatus(): DetectorStatus {
    return this.status;
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
  }

  public isReady(): boolean {
    return this.status === 'ready' && this.landmarker !== null;
  }

  public destroy(): void {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch (e) {
        console.warn('Error closing landmarker:', e);
      }
      this.landmarker = null;
    }
    this.status = 'uninitialized';
    this.errorMessage = null;
  }
}

export const faceLandmarkDetectorService = new FaceLandmarkDetectorService();
