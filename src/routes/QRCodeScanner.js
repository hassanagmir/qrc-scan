
import { Alert, AlertDescription } from '../compoents/ui/Alert';
import { Button } from '../compoents/ui/Button';
import React, { useState, useRef, useCallback } from 'react';
import { Camera, XCircle } from 'lucide-react';
import jsQR from 'jsqr';




const QRCodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startScanning = async () => {
    try {
      setError('');
      setResult('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        
        // Start frame analysis once video is playing
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play();
          requestAnimationFrame(analyzeFrame);
        });
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure you have granted camera permissions.');
      console.error('Camera access error:', err);
    }
  };

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const analyzeFrame = useCallback(() => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR code analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      // QR Code found
      setResult(code.data);
      stopScanning();
    } else {
      // Continue scanning
      requestAnimationFrame(analyzeFrame);
    }
  }, [scanning, stopScanning]);

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <div className="relative">
        {scanning ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-black rounded-lg"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
              <div className="absolute inset-0 border-2 border-transparent">
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-blue-500" />
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-blue-500" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-blue-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-blue-500" />
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={stopScanning}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center">
            <Button onClick={startScanning} className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Start Scanning
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert>
          <AlertDescription>
            <div className="break-all">
              <strong>Scanned QR Code:</strong> {result}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default QRCodeScanner;