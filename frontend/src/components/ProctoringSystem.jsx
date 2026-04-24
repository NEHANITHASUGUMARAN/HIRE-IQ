import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logViolation, startProctoringSession } from '../features/proctoring/proctoringSlice';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';

const ProctoringSystem = ({ sessionId, children }) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const { activeProctoringSession, riskScore } = useSelector((state) => state.proctoring);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [referenceImage, setReferenceImage] = useState(null);

  // New strict-mode states
  const [isTabLocked, setIsTabLocked] = useState(false);
  const [isFaceMissing, setIsFaceMissing] = useState(false);

  // Load models from CDN
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face detection models", err);
      }
    };
    loadModels();
  }, []);

  // Start Camera immediately
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream; // Save to external ref to fully stop on unmount
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error("Failed to start camera", err);
        toast.error("Please allow camera access for proctoring.");
      }
    };

    if (modelsLoaded) {
      startCamera();
    }

    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [modelsLoaded]);

  // Handle Verification & Force Fullscreen
  const verifyFace = async () => {
    // Enforce Fullscreen immediately on user gesture
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen request failed", err);
      });
    }

    if (!videoRef.current) return;

    const detections = await faceapi.detectAllFaces(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detections.length === 0) {
      toast.error("No face detected! Please look clearly at the camera.");
      return;
    }
    if (detections.length > 1) {
      toast.error("Multiple faces detected! Please ensure you are alone.");
      return;
    }

    // Capture Picture
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setReferenceImage(canvas.toDataURL('image/jpeg'));

    toast.success("Identity Verified! Commencing Exam.");
    setIsVerified(true);
    setIsFaceMissing(false);

    if (sessionId) {
      dispatch(startProctoringSession(sessionId));
    }
  };

  // Resume Exam logic after tab lock
  const resumeExam = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        setIsTabLocked(false);
      }).catch(err => {
        toast.error("You must allow Fullscreen to resume the exam!");
        setIsTabLocked(false); // Fallback if browser blocked it but they clicked resume
      });
    } else {
      setIsTabLocked(false);
    }
  };

  const missingFaceCountRef = useRef(0);

  // Face Detection Loop
  useEffect(() => {
    let intervalId;

    if (cameraActive && activeProctoringSession && isVerified) {
      intervalId = setInterval(async () => {
        if (!videoRef.current) return;

        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        if (detections.length === 0) {
          missingFaceCountRef.current += 1;
          // Require 2 consecutive misses (6 seconds) to trigger the massive screen lock
          // This prevents AI hallucinations or split-second dropouts from irritating the user
          if (missingFaceCountRef.current >= 2) {
            setIsFaceMissing(true);
            handleViolation('NO_FACE', 'No face detected in webcam');
          }
        } else {
          // Face reliably detected again!
          missingFaceCountRef.current = 0;
          setIsFaceMissing(false);

          if (detections.length > 1) {
            handleViolation('MULTIPLE_FACES', `${detections.length} faces detected`);
          }
          // The strict OUT_OF_BOUNDS logic has been removed to prevent constant irritating pop-ups.
          // The user now only gets penalized if they are completely out of frame.
        }
      }, 3000); // Strict check every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cameraActive, activeProctoringSession, isVerified]);

  // Global Cheating Event Listeners
  useEffect(() => {
    if (!activeProctoringSession || !isVerified) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('TAB_SWITCH', 'User switched the tab');
        setIsTabLocked(true);
      }
    };

    const onBlur = () => {
      handleViolation('TAB_SWITCH', 'User clicked outside the test window');
      setIsTabLocked(true);
    };

    const onContextMenu = (e) => {
      e.preventDefault();
      handleViolation('RIGHT_CLICK', 'User attempted to right-click');
    };

    const onCopy = (e) => {
      e.preventDefault();
      handleViolation('COPY', 'User attempted to copy content');
    };

    const onPaste = (e) => {
      e.preventDefault();
      handleViolation('PASTE', 'User attempted to paste content'); // Basic paste block
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation('EXIT_FULLSCREEN', 'User exited fullscreen mode');
        setIsTabLocked(true);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [activeProctoringSession, isVerified]);

  const handleViolation = (type, message) => {
    // Don't show toast for NO_FACE since the massive modal handles the UI indication
    if (type !== 'NO_FACE') {
      toast.warning(`WARNING: ${message}`, { autoClose: 3000, toastId: type }); // toastId prevents strict duplications spam
    }

    if (activeProctoringSession?._id) {
      dispatch(logViolation({
        proctoringSessionId: activeProctoringSession._id,
        type,
        metadata: message
      }));
    }
  };

  return (
    <div className="relative w-full h-full">

      {/* Universal Camera Frame */}
      <div className={!isVerified
        ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-space-900 text-white"
        : "fixed top-4 right-4 z-[1000] flex items-center space-x-4 pointer-events-none"}>

        {!isVerified && (
          <div className="text-center mb-8 px-4">
            <h1 className="text-3xl md:text-5xl font-black mb-4 font-display text-glow tracking-widest uppercase">Proctoring Step</h1>
            <p className="text-slate-400 max-w-lg mx-auto">Please look directly into the camera. We must capture a reference snapshot to verify your identity before unlocking the exam.</p>
          </div>
        )}

        <div className={!isVerified
          ? "relative border-4 border-neon-cyan/50 rounded-3xl overflow-hidden mb-8 shadow-[0_0_50px_rgba(0,247,255,0.2)] bg-black pointer-events-auto"
          : "bg-space-900 border border-white/10 p-2 rounded-xl shadow-2xl overflow-hidden glass-panel pointer-events-auto"}>
          <video
            ref={videoRef}
            autoPlay
            muted
            className={!isVerified
              ? "w-[500px] h-[350px] object-cover scale-x-[-1]"
              : `w-36 h-28 object-cover rounded-lg scale-x-[-1] ${!cameraActive && 'hidden'}`
            }
          />
          {isVerified && !cameraActive && (
            <div className="w-36 h-28 flex items-center justify-center text-xs text-slate-400">
              Camera Offline
            </div>
          )}
        </div>

        {!isVerified ? (
          <button
            onClick={verifyFace}
            disabled={!cameraActive || !modelsLoaded}
            className="px-12 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-black tracking-[0.2em] uppercase rounded-2xl hover:scale-[1.02] transition-all shadow-glow disabled:opacity-50 pointer-events-auto z-50"
          >
            {modelsLoaded ? (cameraActive ? "Verify & Start Exam" : "Waiting for Camera...") : "Loading AI Models..."}
          </button>
        ) : activeProctoringSession && (
          <div className="bg-space-900 border border-rose-500/30 p-3 rounded-xl shadow-2xl glass-panel pointer-events-auto flex flex-col items-center justify-center min-w-[100px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk</p>
            <p className={`text-2xl font-black leading-none ${riskScore > 50 ? 'text-rose-500 animate-pulse' : riskScore > 15 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {riskScore}
            </p>
          </div>
        )}
      </div>

      {/* Massive Error Modals Overlapping Children */}
      {isVerified && isTabLocked && (
        <div className="fixed inset-0 z-[999] bg-rose-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white px-4 text-center">
          <span className="text-8xl mb-8 animate-bounce">⚠️</span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">Exam Paused</h1>
          <p className="text-xl md:text-2xl font-medium text-rose-200 max-w-2xl balance leading-relaxed mb-12">
            You navigated away from the exam or exited fullscreen mode. This severe violation has been permanently logged.
          </p>
          <button
            onClick={resumeExam}
            className="px-8 py-4 bg-white text-rose-900 font-black text-lg uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform"
          >
            Acknowledge & Resume
          </button>
          <p className="text-sm font-bold text-rose-300 uppercase tracking-widest mt-6 bg-rose-950/50 px-6 py-2 rounded-full border border-rose-500/30">Your Risk Score is now at critical levels</p>
        </div>
      )}

      {isVerified && isFaceMissing && !isTabLocked && (
        <div className="fixed inset-0 z-[998] bg-amber-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white px-4 text-center pointer-events-none transition-all duration-300">
          <h1 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-widest text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse">
            Please Be In The Camera!
          </h1>
          <p className="text-2xl text-amber-100 font-medium">You are entirely out of view. The test cannot continue.</p>
        </div>
      )}

      {/* If neither are active, or if they are but absolutely positioned over, children will inherently mount. 
          Actually for maximum lockout, we disable pointer events if locked. */}
      <div className={`w-full h-full transition-all duration-500 ${isTabLocked || isFaceMissing ? 'opacity-10 pointer-events-none blur-lg select-none' : 'opacity-100'}`}>
        {isVerified && children}
      </div>

    </div>
  );
};

export default ProctoringSystem;
