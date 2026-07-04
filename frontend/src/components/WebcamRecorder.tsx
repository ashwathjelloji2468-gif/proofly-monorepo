'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, VideoOff, RotateCcw } from 'lucide-react';

interface WebcamRecorderProps {
  onRecordComplete: (blob: Blob, url: string) => void;
  questions?: string[];
  spaceName?: string;
}

export function WebcamRecorder({ onRecordComplete, questions, spaceName }: WebcamRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [streamActive, setStreamActive] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<any | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start camera stream on mount
    startCamera();

    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 360, facingMode: 'user' },
        audio: true
      });
      mediaStreamRef.current = stream;
      setStreamActive(true);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(e => console.warn('Preview play failure:', e));
      }
    } catch (err) {
      console.warn('Webcam permission error:', err);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setStreamActive(false);
  };

  const startRecording = async () => {
    if (!mediaStreamRef.current) {
      await startCamera();
      if (!mediaStreamRef.current) return;
    }

    try {
      const RecordRTC = (await import('recordrtc')).default;
      
      const recorder = new RecordRTC(mediaStreamRef.current, {
        type: 'video',
        mimeType: 'video/webm',
        disableLogs: true
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
      setVideoBlob(null);
      setVideoURL(null);
      setSecondsLeft(60);

      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to import RecordRTC or start recording:', err);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = recorderRef.current;
    if (recorder && isRecording) {
      recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        const url = URL.createObjectURL(blob);
        setVideoBlob(blob);
        setVideoURL(url);
        setIsRecording(false);
        stopCamera();
        onRecordComplete(blob, url);
      });
    }
  };

  const resetRecording = async () => {
    setVideoBlob(null);
    setVideoURL(null);
    setIsRecording(false);
    setSecondsLeft(60);
    await startCamera();
  };

  return (
    <div className="space-y-4">
      {/* Video stream container */}
      <div className="relative bg-[#09090B] border border-border-primary rounded-xl overflow-hidden aspect-video flex items-center justify-center">
        {videoURL ? (
          <video src={videoURL} controls className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoPreviewRef}
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}

        {/* Recording countdown banner */}
        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-600 text-white font-mono text-xs px-2.5 py-1 rounded-md flex items-center space-x-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>0:{secondsLeft < 10 ? '0' : ''}{secondsLeft}</span>
          </div>
        )}

        {/* Guiding Questions Overlay */}
        {!videoURL && streamActive && (
          <div className="absolute bottom-3 left-3 right-3 bg-black/75 border border-white/10 rounded-lg p-2.5 text-left z-20  pointer-events-none">
            <p className="text-[11px] font-black uppercase text-brand-emerald tracking-widest mb-1 flex items-center gap-1">
              <span>💡 Guiding Prompts:</span>
            </p>
            <ul className="space-y-0.5 text-[11px] text-slate-300 font-medium list-decimal pl-3.5">
              {questions && questions.length > 1 ? (
                questions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))
              ) : (
                <>
                  <li>State your name / introduce yourself.</li>
                  <li>What do you love about {spaceName || 'us'}?</li>
                  <li>How did we help you or solve your challenge?</li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* Camera blocked alert */}
        {!streamActive && !videoURL && (
          <div className="text-center p-6 space-y-2">
            <VideoOff className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">Camera access is blocked or unavailable.</p>
            <button 
              onClick={startCamera} 
              className="text-brand-emerald hover:underline text-xs font-semibold cursor-pointer"
            >
              Retry Camera Permission
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-3">
        {videoURL ? (
          <button
            type="button"
            onClick={resetRecording}
            className="bg-[#18181B] hover:bg-[#27272A] border border-border-primary text-slate-200 text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Record Again</span>
          </button>
        ) : isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 cursor-pointer transition"
          >
            <VideoOff className="w-3.5 h-3.5" />
            <span>Stop Recording</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={!streamActive}
            className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs py-2.5 px-4 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-md shadow-brand-emerald/10 transition"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Start Recording</span>
          </button>
        )}
      </div>
    </div>
  );
}
