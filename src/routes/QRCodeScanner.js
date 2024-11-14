
import { Alert, AlertDescription } from '../compoents/ui/Alert';
import { Button } from '../compoents/ui/Button';import React, { useState, useRef, useCallback } from 'react';
import { Camera, XCircle } from 'lucide-react';

const QRCodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [debug, setDebug] = useState(''); // Debug information
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startScanning = async () => {
    try {
      setError('');
      setResult('');
      setDebug('Requesting camera access...');

      // List available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setDebug(prev => `${prev}\nFound ${cameras.length} cameras`);

      // Request camera access with specific constraints
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setDebug(prev => `${prev}\nCamera access granted`);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setDebug(prev => `${prev}\nVideo source set`);
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setDebug(prev => `${prev}\nVideo metadata loaded`);
          videoRef.current.play()
            .then(() => {
              setDebug(prev => `${prev}\nVideo playing`);
              setScanning(true);
            })
            .catch(err => {
              setDebug(prev => `${prev}\nPlay error: ${err.message}`);
              setError(`Failed to play video: ${err.message}`);
            });
        };
      }
    } catch (err) {
      const errorMessage = `Camera access error: ${err.message}`;
      setError(errorMessage);
      setDebug(prev => `${prev}\n${errorMessage}`);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please grant camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a camera.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is in use by another application. Please close other apps using the camera.');
      } else {
        setError(`Unable to access camera: ${err.message}`);
      }
    }
  };

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        setDebug(prev => `${prev}\nStopped track: ${track.kind}`);
      });
      streamRef.current = null;
    }
    setScanning(false);
    setDebug(prev => `${prev}\nScanning stopped`);
  }, []);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

      {/* Debug information */}
      {debug && (
        <Alert>
          <AlertDescription>
            <pre className="whitespace-pre-wrap text-xs">{debug}</pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default QRCodeScanner;