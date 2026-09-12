import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  VideoOff,
  Video,
  Shield,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Eye,
  Crosshair
} from 'lucide-react';
import { faceLandmarkDetectorService, DetectorStatus } from './FaceLandmarkDetector';
import { AttentionDetector, AttentionMetrics } from './AttentionDetector';
import { sounds } from '../../../utils/sound';

interface CameraViewProps {
  onMetricsUpdate: (metrics: AttentionMetrics) => void;
  isSimulatedLookingAway: boolean;
  onToggleSimulatedLookingAway: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onMetricsUpdate,
  isSimulatedLookingAway,
  onToggleSimulatedLookingAway,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [detectorStatus, setDetectorStatus] = useState<DetectorStatus>('uninitialized');
  const [fps, setFps] = useState<number>(0);

  const attentionDetectorRef = useRef<AttentionDetector>(new AttentionDetector());
  const animFrameRef = useRef<number | null>(null);
  const lastFpsTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const onMetricsUpdateRef = useRef(onMetricsUpdate);
  const lastSentMetricsRef = useRef({
    faceDetected: true,
    attentionStatus: 'LOCKED',
    eyeContact: 'MAINTAINED',
    lastSentTime: performance.now(),
  });

  useEffect(() => {
    onMetricsUpdateRef.current = onMetricsUpdate;
  }, [onMetricsUpdate]);

  // Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    let isMounted = true;
    const initDetector = async () => {
      setDetectorStatus('loading');
      const landmarker = await faceLandmarkDetectorService.initialize();
      if (!isMounted) return;
      if (landmarker) {
        setDetectorStatus('ready');
      } else {
        setDetectorStatus('error');
      }
    };
    initDetector();

    return () => {
      isMounted = false;
    };
  }, []);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    sounds.playClick();
    setCameraError(null);
    setIsPermissionDenied(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API is not supported on this device/browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: unknown) {
      console.warn('Webcam stream failed:', err);
      let msg = 'Failed to access camera.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setIsPermissionDenied(true);
          msg = 'Camera permission was denied in your browser.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          msg = 'No camera hardware found on this system.';
        } else {
          msg = err.message;
        }
      }
      setCameraError(msg);
      setStreamActive(false);
    }
  }, []);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    sounds.playClick();
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  }, []);

  // Continuous Detection & HUD Rendering Loop
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const renderLoop = (timestamp: number) => {
      if (!running) return;

      // Calculate FPS
      frameCountRef.current++;
      if (timestamp - lastFpsTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (timestamp - lastFpsTimeRef.current)));
        frameCountRef.current = 0;
        lastFpsTimeRef.current = timestamp;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let metrics: AttentionMetrics;

      if (streamActive && video && video.readyState >= 2 && detectorStatus === 'ready') {
        // Run real MediaPipe FaceLandmarker
        const results = faceLandmarkDetectorService.detect(video, timestamp);
        metrics = attentionDetectorRef.current.evaluate(results);
      } else {
        // Fallback / Simulated Mode
        metrics = {
          faceDetected: true,
          attentionStatus: isSimulatedLookingAway ? 'DISTRACTED' : 'LOCKED',
          eyeContact: isSimulatedLookingAway ? 'LOST' : 'MAINTAINED',
          yawOffset: isSimulatedLookingAway ? 0.35 : 0.02,
          pitchOffset: 0.01,
          confidence: 96,
          keyPoints: {
            nose: { x: isSimulatedLookingAway ? 0.65 : 0.5, y: 0.5 },
            leftEye: { x: isSimulatedLookingAway ? 0.58 : 0.43, y: 0.45 },
            rightEye: { x: isSimulatedLookingAway ? 0.72 : 0.57, y: 0.45 },
            chin: { x: isSimulatedLookingAway ? 0.65 : 0.5, y: 0.7 },
            forehead: { x: isSimulatedLookingAway ? 0.65 : 0.5, y: 0.3 },
            box: {
              minX: isSimulatedLookingAway ? 0.45 : 0.35,
              minY: 0.25,
              maxX: isSimulatedLookingAway ? 0.85 : 0.65,
              maxY: 0.75,
            },
          },
        };
      }

      // Pass metrics to parent on state change or throttled every 200ms
      const now = performance.now();
      const last = lastSentMetricsRef.current;
      const statusChanged =
        last.faceDetected !== metrics.faceDetected ||
        last.attentionStatus !== metrics.attentionStatus ||
        last.eyeContact !== metrics.eyeContact;

      if (statusChanged || now - last.lastSentTime >= 200) {
        last.faceDetected = metrics.faceDetected;
        last.attentionStatus = metrics.attentionStatus;
        last.eyeContact = metrics.eyeContact;
        last.lastSentTime = now;
        onMetricsUpdateRef.current(metrics);
      }

      // Draw HUD visual elements onto canvas
      drawBiometricHUD(ctx, canvas.width, canvas.height, metrics);

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      running = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [streamActive, detectorStatus, isSimulatedLookingAway]);

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Draw HUD overlays
  const drawBiometricHUD = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    metrics: AttentionMetrics
  ) => {
    const isLocked = metrics.attentionStatus === 'LOCKED';
    const primaryColor = isLocked ? '#10b981' : '#f43f5e';
    const secondaryColor = isLocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)';

    // 1. Draw Targeting Brackets around detected face
    if (metrics.faceDetected && metrics.keyPoints?.box) {
      const box = metrics.keyPoints.box;
      // Invert X because the video is mirrored (-scale-x-100)
      const left = (1 - box.maxX) * width;
      const top = box.minY * height;
      const boxW = (box.maxX - box.minX) * width;
      const boxH = (box.maxY - box.minY) * height;

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2.5;

      const corner = Math.min(24, boxW * 0.2);

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(left, top + corner);
      ctx.lineTo(left, top);
      ctx.lineTo(left + corner, top);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(left + boxW - corner, top);
      ctx.lineTo(left + boxW, top);
      ctx.lineTo(left + boxW, top + corner);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(left, top + boxH - corner);
      ctx.lineTo(left, top + boxH);
      ctx.lineTo(left + corner, top + boxH);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(left + boxW - corner, top + boxH);
      ctx.lineTo(left + boxW, top + boxH);
      ctx.lineTo(left + boxW, top + boxH - corner);
      ctx.stroke();

      // Face Center Reticle
      const cx = left + boxW / 2;
      const cy = top + boxH / 2;
      ctx.strokeStyle = secondaryColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Key Gaze Vector Line
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - metrics.yawOffset * 120, cy + metrics.pitchOffset * 100);
      ctx.stroke();

      // Gaze end dot
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(cx - metrics.yawOffset * 120, cy + metrics.pitchOffset * 100, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-black border border-[var(--border-subtle)] shadow-2xl h-80 sm:h-[440px] flex items-center justify-center group">
      {/* Live Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover transform -scale-x-100 ${
          streamActive ? 'block' : 'hidden'
        }`}
      />

      {/* Synthetic Calibration Canvas if Camera is not active */}
      {!streamActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#141726]/80 via-[#0d101d]/90 to-[#070910] text-center p-6 space-y-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-4xl shadow-2xl shadow-indigo-950/50">
              👁️
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Local Webcam Eye Contact Protocol
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
              Connect your webcam to test real-time MediaPipe Face Landmarker detection, or utilize
              the calibrated simulation below.
            </p>
          </div>

          {cameraError && (
            <div className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono max-w-md flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={startCamera}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Connect Live Webcam</span>
            </button>

            <button
              onClick={onToggleSimulatedLookingAway}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all border flex items-center gap-2 active:scale-95 cursor-pointer ${
                isSimulatedLookingAway
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/15'
              }`}
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{isSimulatedLookingAway ? 'Simulate Look Back' : 'Simulate Look Away'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay Canvas for HUD Target Brackets and Landmarks */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Top HUD Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-2 shadow-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                streamActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span>{streamActive ? 'LIVE WEBCAM ACTIVE' : 'SIMULATION PROTOCOL'}</span>
          </div>

          <div className="hidden sm:flex bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300 items-center gap-1.5 shadow-lg">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              MediaPipe:{' '}
              <strong
                className={
                  detectorStatus === 'ready'
                    ? 'text-emerald-400'
                    : detectorStatus === 'loading'
                    ? 'text-amber-400 animate-pulse'
                    : 'text-slate-400'
                }
              >
                {detectorStatus.toUpperCase()}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {streamActive && (
            <button
              onClick={stopCamera}
              className="bg-black/70 hover:bg-rose-500/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
              title="Stop Camera Stream"
            >
              <VideoOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Disable Cam</span>
            </button>
          )}

          <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 shadow-lg">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">100% Local In-Browser Vision</span>
          </div>
        </div>
      </div>

      {/* Floating Status Warning when Distracted */}
      {isSimulatedLookingAway && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-rose-500/20 backdrop-blur-2xl border border-rose-500/50 px-5 py-2 rounded-2xl text-center shadow-2xl animate-bounce pointer-events-none">
          <div className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-bold">
            GAZE DIVERTED
          </div>
          <div className="text-xs font-mono text-white font-semibold">
            Status: LOOKING AWAY
          </div>
        </div>
      )}
    </div>
  );
};
