import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
    User, Phone, Fingerprint, MapPin, Loader2, CheckCircle2, CheckCircle,
    FileCheck, Scan, ShieldCheck, ChevronRight, ArrowLeft,
    AlertCircle, Target, Crosshair, Video, VideoOff, Camera, RefreshCw, Upload
} from "lucide-react";
import PageHero from "../../layout/PageHero";
import { useAuth } from "../../../context/AuthContext";
import { uploadKYCDocument, submitKYC } from "../../../services/kyc";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const fetchAddress = async (lat: number, lng: number, setAddress: (addr: string) => void) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json().catch(() => ({}));
        if (data.display_name) {
            setAddress(data.display_name);
        }
    } catch (error) {
        console.error("Error fetching address:", error);
    }
};

const LocationMarker = ({ position, setPosition, setAddress }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void, setAddress: (addr: string) => void }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            fetchAddress(e.latlng.lat, e.latlng.lng, setAddress);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

export default function EnterpriseKYC() {
    const [step, setStep] = useState(1);
    const [activeField, setActiveField] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // Form Stats
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [secondaryPhone, setSecondaryPhone] = useState("");

    const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
    const [secondaryIdType, setSecondaryIdType] = useState("");
    const [secondaryIdNumber, setSecondaryIdNumber] = useState("");
    const [address, setAddress] = useState("");
    const [mapPosition, setMapPosition] = useState<L.LatLng | null>(null);
    const [isMapActive, setIsMapActive] = useState(false);
    const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
    const [idBackFile, setIdBackFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [secondaryIdFrontFile, setSecondaryIdFrontFile] = useState<File | null>(null);
    const [secondaryIdBackFile, setSecondaryIdBackFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
        if (e.target.files && e.target.files[0]) {
            setter(e.target.files[0]);
        }
    };

    const [selfieVideoFile, setSelfieVideoFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [isPreparingVideo, setIsPreparingVideo] = useState(false);
    const [isFinalizingVideo, setIsFinalizingVideo] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const recordingTimerRef = React.useRef<number | null>(null);
    const chunksRef = React.useRef<Blob[]>([]);
    const streamRef = React.useRef<MediaStream | null>(null);
    const stoppingRef = React.useRef<boolean>(false);
    const discardRecordingRef = React.useRef<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const getSupportedRecorderMimeType = (): string | undefined => {
        if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
            return undefined;
        }

        const mimeTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
            'video/mp4'
        ];

        return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
    };

    const cleanupMediaSession = () => {
        if (recordingTimerRef.current !== null) {
            window.clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.pause?.();
            videoRef.current.srcObject = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        mediaRecorderRef.current = null;
        chunksRef.current = [];
        stoppingRef.current = false;
    };

    const finalizeRecording = (blob: Blob, mimeType?: string) => {
        if (blob.size === 0) {
            setVideoError("Video capture did not finalize. Please try again.");
            setIsFinalizingVideo(false);
            setStream(null);
            cleanupMediaSession();
            return;
        }

        const resolvedMimeType = mimeType || blob.type || 'video/webm';
        const extension = resolvedMimeType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `selfie-video-${Date.now()}.${extension}`, { type: resolvedMimeType });

        setSelfieVideoFile(file);
        setVideoError(null);
        setIsPreparingVideo(false);
        setIsFinalizingVideo(false);
        setStream(null);
        cleanupMediaSession();
    };

    const waitForPreviewFrame = async (): Promise<HTMLVideoElement> => {
        const startedAt = Date.now();

        while (Date.now() - startedAt < 4000) {
            const videoElement = videoRef.current;
            if (videoElement && videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
                return videoElement;
            }

            await new Promise((resolve) => window.setTimeout(resolve, 100));
        }

        throw new Error("Video preview did not become ready in time.");
    };

    const captureSelfieFrame = async () => {
        try {
            const videoElement = await waitForPreviewFrame();
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth || 640;
            canvas.height = videoElement.videoHeight || 480;

            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error("Unable to access canvas context for selfie capture.");
            }

            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/jpeg', 0.92);
            });

            if (blob) {
                const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
                setSelfieFile(file);
            }
        } catch (error) {
            console.error("Selfie frame capture failed:", error);
        }
    };

    const stopRecording = () => {
        const mediaRecorder = mediaRecorderRef.current;

        if (!mediaRecorder || mediaRecorder.state === 'inactive' || stoppingRef.current) {
            return;
        }

        stoppingRef.current = true;
        setIsRecording(false);
        setIsFinalizingVideo(true);

        if (recordingTimerRef.current !== null) {
            window.clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }

        try {
            mediaRecorder.stop();
        } catch (error) {
            console.error("Stopping recorder failed:", error);
            setVideoError("Video capture could not be finalized. Please try again.");
            setIsFinalizingVideo(false);
            setStream(null);
            cleanupMediaSession();
        }
    };

    useEffect(() => {
        if (!stream || !videoRef.current) {
            return;
        }

        const videoElement = videoRef.current;
        videoElement.srcObject = stream;
        videoElement.muted = true;
        videoElement.playsInline = true;
        void videoElement.play().catch((error) => {
            console.error("Video preview playback failed:", error);
        });

        return () => {
            if (videoElement.srcObject === stream) {
                videoElement.srcObject = null;
            }
        };
    }, [stream, isRecording]);

    useEffect(() => cleanupMediaSession, []);

    const startRecording = async () => {
        if (isPreparingVideo || isRecording || isFinalizingVideo) {
            return;
        }

        setVideoError(null);
        setIsPreparingVideo(true);
        setIsFinalizingVideo(false);
        setRecordingTime(0);
        setSelfieVideoFile(null);
        setSelfieFile(null);
        chunksRef.current = [];
        discardRecordingRef.current = false;

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera access is not supported on this device/browser.");
            }

            if (typeof window === 'undefined' || !window.MediaRecorder) {
                throw new Error("Video recording is not supported in this browser. Please use a modern browser.");
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: "user" }, 
                audio: false 
            });

            streamRef.current = mediaStream;
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            const supportedMimeType = getSupportedRecorderMimeType();
            let mediaRecorder: MediaRecorder;

            try {
                mediaRecorder = supportedMimeType
                    ? new MediaRecorder(mediaStream, { mimeType: supportedMimeType })
                    : new MediaRecorder(mediaStream);
            } catch (error) {
                console.error("Recorder initialization with preferred mime type failed:", error);
                mediaRecorder = new MediaRecorder(mediaStream);
            }
            
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                setIsRecording(false);

                const shouldDiscard = discardRecordingRef.current;
                discardRecordingRef.current = false;

                if (shouldDiscard) {
                    setIsFinalizingVideo(false);
                    setStream(null);
                    cleanupMediaSession();
                    return;
                }

                const recordedChunks = chunksRef.current.filter((chunk) => chunk.size > 0);
                const actualMimeType = mediaRecorder.mimeType || supportedMimeType || recordedChunks[0]?.type || 'video/webm';

                if (recordedChunks.length === 0) {
                    setVideoError("Video capture did not finalize. Please try again.");
                    setIsFinalizingVideo(false);
                    setStream(null);
                    cleanupMediaSession();
                    return;
                }

                finalizeRecording(new Blob(recordedChunks, { type: actualMimeType }), actualMimeType);
            };

            mediaRecorder.onerror = (event) => {
                console.error("Recorder error:", event);
                setVideoError("Video recording failed. Please try again.");
                setIsPreparingVideo(false);
                setIsRecording(false);
                setIsFinalizingVideo(false);
                setStream(null);
                cleanupMediaSession();
            };

            mediaRecorder.start();
            setIsPreparingVideo(false);
            setIsRecording(true);
            setRecordingTime(0);
            void captureSelfieFrame();

            recordingTimerRef.current = window.setInterval(() => {
                setRecordingTime(prev => {
                    const next = prev + 1;
                    if (next >= 3) {
                        stopRecording();
                        if (recordingTimerRef.current !== null) {
                            window.clearInterval(recordingTimerRef.current);
                            recordingTimerRef.current = null;
                        }
                        return 3;
                    }
                    return next;
                });
            }, 1000);

        } catch (err) {
            console.error("Camera access error:", err);
            setVideoError(err instanceof Error ? err.message : "Camera access denied. Video verification is mandatory.");
            setIsPreparingVideo(false);
            setIsRecording(false);
            setIsFinalizingVideo(false);
            setStream(null);
            cleanupMediaSession();
        }
    };

    const resetVideoCapture = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            discardRecordingRef.current = true;
            stopRecording();
        } else {
            setStream(null);
            cleanupMediaSession();
        }

        setSelfieVideoFile(null);
        setSelfieFile(null);
        setVideoError(null);
        setRecordingTime(0);
        setIsPreparingVideo(false);
        setIsFinalizingVideo(false);
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            if (file.size > 50 * 1024 * 1024) {
                setVideoError("Video file is too large. Maximum size is 50MB.");
                return;
            }

            setSelfieVideoFile(file);
            setVideoError(null);
            
            try {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.muted = true;
                video.playsInline = true;
                
                const url = URL.createObjectURL(file);
                video.src = url;
                
                video.onloadeddata = () => {
                    video.currentTime = 0.5;
                };
                
                video.onseeked = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const selfie = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
                            setSelfieFile(selfie);
                        }
                        URL.revokeObjectURL(url);
                    }, 'image/jpeg');
                };
                
                video.onerror = () => {
                    console.warn("Could not extract frame from uploaded video.");
                    URL.revokeObjectURL(url);
                };
            } catch (err) {
                console.error("Frame extraction failed:", err);
            }
        }
    };

    const [uploadProgress, setUploadProgress] = useState({ front: 0, back: 0, selfie: 0, video: 0, secondaryFront: 0, secondaryBack: 0 });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!fullName.trim()) newErrors.fullName = "Full Legal Name is required";
        if (!phone.trim()) newErrors.phone = "Primary Mobile is required";
        else if (phone.length !== 10) newErrors.phone = "Must be 10 digits";

        if (secondaryPhone && secondaryPhone.length !== 10) newErrors.secondaryPhone = "Must be 10 digits";

        if (!drivingLicenseNumber.trim()) newErrors.drivingLicenseNumber = "Driving License is required";
        if (!secondaryIdType) newErrors.secondaryIdType = "Secondary ID Type is required";
        
        if (secondaryIdType) {
            if (!secondaryIdNumber.trim()) newErrors.secondaryIdNumber = "Secondary ID Number is required";
        }
        
        if (!address.trim()) newErrors.address = "Residential Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const detectLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const latlng = L.latLng(latitude, longitude);
                setMapPosition(latlng);
                await fetchAddress(latitude, longitude, setAddress);
                setIsLocating(false);
                setIsMapActive(true);
            }, (error) => {
                console.error("Error getting location:", error);
                setIsLocating(false);
            });
        } else {
            setIsLocating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
            }
            return;
        }

        if (step === 2) {
            if (isPreparingVideo || isRecording || isFinalizingVideo) {
                return;
            }

            if (!idFrontFile || !idBackFile || !selfieVideoFile || !secondaryIdFrontFile || !secondaryIdBackFile) {
                if (!selfieVideoFile) {
                    setVideoError("Complete the video liveness check before continuing.");
                }
                
                const newErrors: Record<string, string> = { ...errors };
                if (!secondaryIdFrontFile) newErrors.secondaryIdFront = "Secondary ID Front is required";
                if (!secondaryIdBackFile) newErrors.secondaryIdBack = "Secondary ID Back is required";
                setErrors(newErrors);
                
                return;
            }
            setVideoError(null);
            setStep(3);
            return;
        }

        if (!user || !idFrontFile || !idBackFile || !selfieVideoFile) {
            alert("Please ensure you are logged in and all biometric nodes are active.");
            return;
        }

        if (!user.id) {
            alert("User ID not found. Please log out and log back in.");
            return;
        }

        setIsSubmitting(true);

        try {
            console.log("Starting document upload for user:", user.id);
            
            // Upload ID Front
            const idFrontUrl = await uploadKYCDocument(user.id, idFrontFile, 'id-front', (progress) => {
                setUploadProgress(prev => ({ ...prev, front: progress }));
            });

            // Upload ID Back
            const idBackUrl = await uploadKYCDocument(user.id, idBackFile, 'id-back', (progress) => {
                setUploadProgress(prev => ({ ...prev, back: progress }));
            });

            // Upload Selfie Image
            let selfieUrl = "";
            if (selfieFile) {
                selfieUrl = await uploadKYCDocument(user.id, selfieFile, 'selfie', (progress) => {
                    setUploadProgress(prev => ({ ...prev, selfie: progress }));
                });
            }

            // Upload Selfie Video
            const selfieVideoUrl = await uploadKYCDocument(user.id, selfieVideoFile, 'selfie-video', (progress) => {
                setUploadProgress(prev => ({ ...prev, video: progress }));
            });

            // Upload Secondary ID images
            let secondaryIdFrontUrl = '';
            let secondaryIdBackUrl = '';
            if (secondaryIdType && secondaryIdFrontFile) {
                secondaryIdFrontUrl = await uploadKYCDocument(user.id, secondaryIdFrontFile, 'secondary-id-front', (progress) => {
                    setUploadProgress(prev => ({ ...prev, secondaryFront: progress }));
                });
                if (secondaryIdBackFile) {
                    secondaryIdBackUrl = await uploadKYCDocument(user.id, secondaryIdBackFile, 'secondary-id-back', (progress) => {
                        setUploadProgress(prev => ({ ...prev, secondaryBack: progress }));
                    });
                }
            }

            // Submit Data directly
            await submitKYC(user.id, {
                fullName,
                phone,
                secondaryPhone,
                drivingLicenseNumber,
                secondaryIdType: secondaryIdType || 'none',
                secondaryIdNumber,
                secondaryIdFrontUrl,
                secondaryIdBackUrl,
                address,
                addressRequiredForDelivery: true,
                idFrontUrl,
                idBackUrl,
                selfieUrl,
                selfieVideoUrl,
                livenessCheck: 'PASSED'
            });

            setIsSubmitted(true);
            setIsSubmitting(false);

            // Redirect after brief success message
            setTimeout(() => {
                const redirectPath = sessionStorage.getItem('redirectAfterKYC');
                if (redirectPath) {
                    sessionStorage.removeItem('redirectAfterKYC');
                    navigate(redirectPath);
                } else {
                    navigate("/dashboard");
                }
            }, 3000);

        } catch (error: any) {
            console.error("KYC Submission Failed:", error);
            const errorMessage = error?.message || error?.code || "Unknown error";
            alert(`Failed to submit KYC: ${errorMessage}. Please try again.`);
            setIsSubmitting(false);
        }
    };


    return (
        <div className="min-h-dvh bg-[#080112] font-sans">
            <PageHero
                title="IDENTITY VERIFICATION"
                subtitle="KYC Document Submission"
                height="60vh"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 pb-32">
                <div className="max-w-4xl mx-auto">
                    {/* Back button */}
                    <div className="mb-8">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gaming-accent transition-colors group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Records</span>
                        </Link>
                    </div>

                    {/* FORM PANEL */}
                    <div className="relative bg-[#080112] border border-white/10 rounded-3xl p-6 md:p-12 lg:p-16 text-white shadow-2xl shadow-black/50">
                        <div className="max-w-3xl mx-auto flex flex-col justify-center">

                            {/* Progress Stepper */}
                            <div className="mb-12">
                                <div className="flex justify-between items-center relative">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
                                    <div
                                        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-gaming-accent to-gaming-accent -translate-y-1/2 transition-all duration-500"
                                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                                    />
                                    {[1, 2, 3].map((s) => (
                                        <div key={s} className="relative z-10 flex flex-col items-center gap-2 group">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-300 border ${step === s
                                                ? 'bg-gaming-accent text-white border-gaming-accent shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                                                : step > s
                                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                                    : 'bg-[#080112] text-gray-600 border-white/10 group-hover:border-white/20'
                                                }`}>
                                                {step > s ? <CheckCircle2 size={20} /> : s}
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${step >= s ? 'text-white' : 'text-gray-600'}`}>
                                                {s === 1 ? 'IDENTITY' : s === 2 ? 'DOCUMENTS' : 'STATUS'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-12 min-h-[400px]">
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-gaming-accent/20 flex items-center justify-center text-gaming-accent font-black">1</div>
                                                <h2 className="text-xl font-black tracking-widest uppercase italic">Personal Details</h2>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="group">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-gaming-accent transition-colors">Full Legal Name</label>
                                                    <div className={`relative bg-[#080112] border rounded-xl overflow-hidden transition-all duration-300 ${activeField === 'name' ? 'border-gaming-accent shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-white/10'}`}>
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                            <User size={18} />
                                                        </div>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={fullName}
                                                            onChange={(e) => setFullName(e.target.value)}
                                                            placeholder="John Doe"
                                                            onFocus={() => setActiveField('name')}
                                                            onBlur={() => setActiveField(null)}
                                                            className="w-full bg-transparent p-4 pl-12 text-white outline-none placeholder:text-gray-700 font-bold"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="group">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-gaming-accent transition-colors">Primary Mobile (10 Digits)</label>
                                                    <div className={`relative bg-[#080112] border rounded-xl overflow-hidden transition-all duration-300 ${activeField === 'phone' ? 'border-gaming-accent shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-white/10'}`}>
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                            <Phone size={18} />
                                                        </div>
                                                        <input
                                                            required
                                                            type="tel"
                                                            maxLength={10}
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                                            placeholder="9876543210"
                                                            onFocus={() => setActiveField('phone')}
                                                            onBlur={() => setActiveField(null)}
                                                            className="w-full bg-transparent p-4 pl-12 font-mono outline-none placeholder:text-gray-700 text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="group">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-gaming-accent transition-colors">Secondary Mobile (10 Digits)</label>
                                                    <div className={`relative bg-[#080112] border rounded-xl overflow-hidden transition-all duration-300 ${activeField === 'phone2' ? 'border-gaming-accent shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-white/10'}`}>
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                            <Phone size={18} className="opacity-50" />
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            maxLength={10}
                                                            value={secondaryPhone}
                                                            onChange={(e) => setSecondaryPhone(e.target.value.replace(/\D/g, ''))}
                                                            placeholder="9876543210"
                                                            onFocus={() => setActiveField('phone2')}
                                                            onBlur={() => setActiveField(null)}
                                                            className="w-full bg-transparent p-4 pl-12 font-mono outline-none placeholder:text-gray-700 text-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="group">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-gaming-accent transition-colors">Driving License Number</label>
                                                    <div className={`relative bg-[#080112] border rounded-xl overflow-hidden transition-all duration-300 ${activeField === 'dl' ? 'border-gaming-accent shadow-[0_0_20px_rgba(168,85,247,0.1)]' : errors.drivingLicenseNumber ? 'border-red-500/50' : 'border-white/10'}`}>
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                            <Fingerprint size={18} />
                                                        </div>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={drivingLicenseNumber}
                                                            onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                                                            placeholder="DL-XXXXXXXXXXXXX"
                                                            onFocus={() => setActiveField('dl')}
                                                            onBlur={() => setActiveField(null)}
                                                            className="w-full bg-transparent p-4 pl-12 text-white font-mono outline-none placeholder:text-gray-700"
                                                        />
                                                    </div>
                                                    {errors.drivingLicenseNumber && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold uppercase tracking-tighter">{errors.drivingLicenseNumber}</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="group">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-gaming-accent transition-colors">Secondary ID Type</label>
                                                    <div className={`relative bg-[#080112] border rounded-xl overflow-hidden transition-all duration-300 ${activeField === 'secIdType' ? 'border-gaming-accent shadow-[0_0_20px_rgba(168,85,247,0.1)]' : errors.secondaryIdType ? 'border-red-500/50' : 'border-white/10'}`}>
                                                        <select
                                                            required
                                                            value={secondaryIdType}
                                                            onChange={(e) => setSecondaryIdType(e.target.value)}
                                                            onFocus={() => setActiveField('secIdType')}
                                                            onBlur={() => setActiveField(null)}
                                                            className="w-full bg-transparent p-4 text-white outline-none font-bold appearance-none cursor-pointer"
                                                        >
                                                            <option value="" disabled className="bg-[#080112]">Select ID Type</option>
                                                            <option value="aadhar" className="bg-[#080112]">Aadhar Card</option>
                                                            <option value="passport" className="bg-[#080112]">Passport</option>
                                                            <option value="voter" className="bg-[#080112]">Voter ID</option>
                                                            <option value="pan" className="bg-[#080112]">PAN Card</option>
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                            <ChevronRight size={18} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                    {errors.secondaryIdType && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold uppercase tracking-tighter">{errors.secondaryIdType}</p>}
                                                </div>

                                                <div className="group">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-gaming-accent transition-colors">Secondary ID Number</label>
                                                    <div className={`relative bg-[#080112] border rounded-xl overflow-hidden transition-all duration-300 ${activeField === 'secIdNum' ? 'border-gaming-accent shadow-[0_0_20px_rgba(168,85,247,0.1)]' : errors.secondaryIdNumber ? 'border-red-500/50' : 'border-white/10'}`}>
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                            <FileCheck size={18} />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={secondaryIdNumber}
                                                            onChange={(e) => setSecondaryIdNumber(e.target.value)}
                                                            placeholder={secondaryIdType ? "Enter ID number" : "Select ID type first"}
                                                            disabled={!secondaryIdType}
                                                            onFocus={() => setActiveField('secIdNum')}
                                                            onBlur={() => setActiveField(null)}
                                                            className="w-full bg-transparent p-4 pl-12 text-white font-mono outline-none placeholder:text-gray-700 disabled:opacity-30"
                                                        />
                                                    </div>
                                                    {errors.secondaryIdNumber && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold uppercase tracking-tighter">{errors.secondaryIdNumber}</p>}
                                                </div>
                                            </div>

                                            <div className="group">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-gaming-accent transition-colors">Residential Address</label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsMapActive(!isMapActive)}
                                                            className={`text-[10px] font-black flex items-center gap-1 uppercase tracking-[0.1em] transition-colors ${isMapActive ? 'text-gaming-accent' : 'text-gray-500 hover:text-white'}`}
                                                        >
                                                            <Crosshair size={12} />
                                                            {isMapActive ? "Close Map" : "Mark on Map"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={detectLocation}
                                                            disabled={isLocating}
                                                            className="text-[10px] font-black text-gaming-accent hover:text-gaming-accent/80 flex items-center gap-1 disabled:opacity-50 uppercase tracking-[0.1em]"
                                                        >
                                                            {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Target size={12} />}
                                                            {isLocating ? "Locating..." : "Auto-Locate"}
                                                        </button>
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {isMapActive && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                                                            animate={{ height: 350, opacity: 1, marginBottom: 16 }}
                                                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                                                            className="relative rounded-xl border border-white/10 bg-[#080112] overflow-hidden group/map"
                                                        >
                                                            <MapContainer 
                                                                center={[20.5937, 78.9629]} 
                                                                zoom={5} 
                                                                style={{ height: '100%', width: '100%', background: '#080112' }}
                                                                attributionControl={false}
                                                            >
                                                                <TileLayer
                                                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                                                />
                                                                <LocationMarker 
                                                                    position={mapPosition} 
                                                                    setPosition={setMapPosition} 
                                                                    setAddress={setAddress} 
                                                                />
                                                            </MapContainer>
                                                            
                                                            {/* Overlay elements */}
                                                            <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
                                                                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-lg">
                                                                    <p className="text-[8px] font-black text-white uppercase tracking-widest">Global Mapping Service</p>
                                                                </div>
                                                            </div>

                                                            <div className="absolute bottom-4 right-4 z-[1000] pointer-events-none text-right">
                                                                {mapPosition && (
                                                                    <p className="text-[10px] font-mono text-gaming-accent bg-black/60 backdrop-blur-md px-2 py-1 rounded">LOC: {mapPosition.lat.toFixed(4)}°N / {mapPosition.lng.toFixed(4)}°E</p>
                                                                )}
                                                            </div>

                                                            {!mapPosition && (
                                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 group-hover/map:opacity-100 transition-opacity z-[1000]">
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">Tap to set location</p>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div className={`relative bg-[#080112] border rounded-xl overflow-hidden transition-all duration-300 ${activeField === 'address' ? 'border-gaming-accent shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-white/10'}`}>
                                                    <div className="absolute left-4 top-4 text-gray-500">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <textarea
                                                        required
                                                        rows={3}
                                                        placeholder="Enter full residential address"
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                        onFocus={() => setActiveField('address')}
                                                        onBlur={() => setActiveField(null)}
                                                        className="w-full bg-transparent p-4 pl-12 text-white outline-none placeholder:text-gray-700 resize-none font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-gaming-accent/20 flex items-center justify-center text-gaming-accent font-black">2</div>
                                                <h2 className="text-xl font-black tracking-widest uppercase italic">Verification Documents</h2>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* ID Front Upload */}
                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 block text-center">Primary ID (Front)</label>
                                                    <div className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all min-h-[160px] flex flex-col items-center justify-center overflow-hidden ${idFrontFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:border-gaming-accent hover:bg-white/5'}`}>
                                                        <input 
                                                            type="file" 
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                            onChange={(e) => handleFileChange(e, setIdFrontFile)} 
                                                            accept="image/*,.pdf" 
                                                        />

                                                        {idFrontFile ? (
                                                            <div className="text-center">
                                                                <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={24} />
                                                                <p className="text-[10px] font-mono text-white truncate max-w-[150px] mx-auto">{idFrontFile.name}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <FileCheck className="text-gaming-accent mx-auto mb-2 group-hover:scale-110 transition-transform" size={24} />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Front Side</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* ID Back Upload */}
                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 block text-center">Primary ID (Back)</label>
                                                    <div className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all min-h-[160px] flex flex-col items-center justify-center overflow-hidden ${idBackFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:border-gaming-accent hover:bg-white/5'}`}>
                                                        <input 
                                                            type="file" 
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                            onChange={(e) => handleFileChange(e, setIdBackFile)} 
                                                            accept="image/*,.pdf" 
                                                        />

                                                        {idBackFile ? (
                                                            <div className="text-center">
                                                                <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={24} />
                                                                <p className="text-[10px] font-mono text-white truncate max-w-[150px] mx-auto">{idBackFile.name}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <FileCheck className="text-gaming-accent mx-auto mb-2 group-hover:scale-110 transition-transform" size={24} />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Back Side</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Selfie Video Verification */}
                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 block text-center">Biometric Video Check</label>
                                                    <div className={`relative rounded-2xl p-4 text-center transition-all min-h-[200px] flex flex-col items-center justify-center overflow-hidden border-2 ${selfieVideoFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-gaming-accent/30 bg-black/40'}`}>
                                                        
                                                        {selfieVideoFile ? (
                                                            <div className="text-center space-y-3">
                                                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                                                    <Video size={32} className="text-emerald-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase text-emerald-500">Video Confirmed</p>
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    onClick={resetVideoCapture}
                                                                    className="flex items-center gap-1 mx-auto text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest pt-2"
                                                                >
                                                                    <RefreshCw size={12} /> Retake
                                                                </button>
                                                            </div>
                                                        ) : isFinalizingVideo ? (
                                                            <div className="text-center space-y-4 py-4">
                                                                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                                                                    <Loader2 size={28} className="text-amber-500 animate-spin" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Saving Video...</p>
                                                                    <p className="text-[9px] text-gray-500 font-mono mt-1 px-4">Processing the verification stream</p>
                                                                </div>
                                                            </div>
                                                        ) : isPreparingVideo ? (
                                                            <div className="text-center space-y-4 py-4">
                                                                <div className="w-16 h-16 bg-gaming-accent/10 rounded-full flex items-center justify-center mx-auto border border-gaming-accent/20">
                                                                    <Loader2 size={28} className="text-gaming-accent animate-spin" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gaming-accent">Starting Camera...</p>
                                                                    <p className="text-[9px] text-gray-500 font-mono mt-1 px-4">Connecting to your secure camera feed</p>
                                                                </div>
                                                            </div>
                                                        ) : isRecording ? (
                                                            <div className="w-full space-y-4">
                                                                <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-red-500/50">
                                                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                                                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">REC 00:0{recordingTime}</span>
                                                                    </div>
                                                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                                                                        <motion.div 
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${(recordingTime / 3) * 100}%` }}
                                                                            className="h-full bg-red-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <p className="text-[10px] font-black text-gaming-accent animate-pulse uppercase tracking-[0.2em]">Please move your head slightly</p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center space-y-4 py-4 w-full">
                                                                <div className="w-16 h-16 bg-gaming-accent/10 rounded-full flex items-center justify-center mx-auto border border-gaming-accent/20">
                                                                    <Scan size={32} className="text-gaming-accent" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Biometric Scan Required</p>
                                                                    <p className="text-[9px] text-gray-500 font-mono mt-1 px-4">Record a 3-second video or upload a file to confirm identity</p>
                                                                </div>
                                                                <div className="flex flex-col gap-2 px-6">
                                                                    <button
                                                                        type="button"
                                                                        onClick={startRecording}
                                                                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gaming-accent text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#9333EA] transition-all w-full"
                                                                    >
                                                                        <Camera size={14} /> Open Camera
                                                                    </button>
                                                                    <div className="relative w-full">
                                                                        <input 
                                                                            type="file" 
                                                                            accept="video/*" 
                                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                                            onChange={handleVideoUpload}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all w-full"
                                                                        >
                                                                            <Upload size={14} /> Upload Video
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {videoError && (
                                                        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-left">
                                                            <VideoOff size={16} className="text-red-400 shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Video Error</p>
                                                                <p className="text-[10px] font-mono text-red-200/80 mt-1">{videoError}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {secondaryIdType && secondaryIdType !== 'none' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 block text-center">Secondary ID ({secondaryIdType}) - Front</label>
                                                        <div className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all min-h-[160px] flex flex-col items-center justify-center overflow-hidden ${secondaryIdFrontFile ? 'border-emerald-500 bg-emerald-500/5' : errors.secondaryIdFront ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-gaming-accent hover:bg-white/5'}`}>
                                                            <input 
                                                                type="file" 
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                                onChange={(e) => handleFileChange(e, setSecondaryIdFrontFile)} 
                                                                accept="image/*,.pdf" 
                                                            />
                                                            {secondaryIdFrontFile ? (
                                                                <div className="text-center">
                                                                    <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={24} />
                                                                    <p className="text-[10px] font-mono text-white truncate max-w-[150px] mx-auto">{secondaryIdFrontFile.name}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <Upload className="text-gaming-accent mx-auto mb-2 group-hover:scale-110 transition-transform" size={24} />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Front Side</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {errors.secondaryIdFront && <p className="text-[10px] text-red-500 text-center font-bold uppercase tracking-tighter">{errors.secondaryIdFront}</p>}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 block text-center">Secondary ID ({secondaryIdType}) - Back</label>
                                                        <div className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all min-h-[160px] flex flex-col items-center justify-center overflow-hidden ${secondaryIdBackFile ? 'border-emerald-500 bg-emerald-500/5' : errors.secondaryIdBack ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-gaming-accent hover:bg-white/5'}`}>
                                                            <input 
                                                                type="file" 
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                                onChange={(e) => handleFileChange(e, setSecondaryIdBackFile)} 
                                                                accept="image/*,.pdf" 
                                                            />
                                                            {secondaryIdBackFile ? (
                                                                <div className="text-center">
                                                                    <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={24} />
                                                                    <p className="text-[10px] font-mono text-white truncate max-w-[150px] mx-auto">{secondaryIdBackFile.name}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <Upload className="text-gaming-accent mx-auto mb-2 group-hover:scale-110 transition-transform" size={24} />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Back Side</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {errors.secondaryIdBack && <p className="text-[10px] text-red-500 text-center font-bold uppercase tracking-tighter">{errors.secondaryIdBack}</p>}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4">
                                                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 h-fit">
                                                    <AlertCircle size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black uppercase tracking-wider text-white mb-1">Upload Guidelines</h4>
                                                    <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4 font-mono">
                                                        <li>Ensure all document text is clearly visible</li>
                                                        <li>Center your face within the camera frame</li>
                                                        <li>Use a well-lit environment for the video</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-gaming-accent/20 flex items-center justify-center text-gaming-accent font-black">3</div>
                                                <h2 className="text-xl font-black tracking-widest uppercase italic">
                                                    {isSubmitted ? 'Process Complete' : isSubmitting ? 'Uploading' : 'Final Status'}
                                                </h2>
                                            </div>

                                            {isSubmitted ? (
                                                <div className="space-y-8 bg-black/40 border border-emerald-500/20 rounded-3xl p-12 text-center">
                                                    <div className="relative w-20 h-20 mx-auto">
                                                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl animate-pulse rounded-full" />
                                                        <div className="relative bg-emerald-500/10 border border-emerald-500/30 w-full h-full rounded-full flex items-center justify-center text-emerald-500">
                                                            <CheckCircle size={40} className="animate-bounce" />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <h3 className="text-xl font-black uppercase tracking-widest text-white italic">Submission Successful</h3>
                                                        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                                                            Your verification documents have been submitted for manual review. Our team will audit your files shortly.
                                                        </p>
                                                    </div>

                                                    <div className="pt-4 flex flex-col items-center gap-3">
                                                        <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                                                            <Loader2 size={12} className="animate-spin" />
                                                            Returning to Dashboard
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : isSubmitting ? (
                                                <div className="space-y-8 bg-black/40 border border-white/5 rounded-3xl p-12 text-center">
                                                    <div className="relative w-20 h-20 mx-auto">
                                                        <div className="absolute inset-0 bg-gaming-accent/20 blur-2xl animate-pulse rounded-full" />
                                                        <div className="relative bg-gaming-accent/10 border border-gaming-accent/30 w-full h-full rounded-full flex items-center justify-center text-gaming-accent">
                                                            <Loader2 size={40} className="animate-spin" />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <h3 className="text-xl font-black uppercase tracking-widest text-gaming-accent italic">Uploading Files</h3>
                                                        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                                                            Please wait while we securely transmit your documents for manual verification...
                                                        </p>
                                                    </div>

                                                    <div className="w-full max-w-xs mx-auto h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '100%' }}
                                                            transition={{ duration: 15, ease: "linear" }}
                                                            className="h-full bg-gaming-accent"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-[#080112] border border-white/5 rounded-3xl p-8 space-y-6">
                                                    <div className="grid grid-cols-2 gap-8">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <p className="text-[10px] uppercase font-black text-gray-600 tracking-widest mb-1">Full Name</p>
                                                                <p className="text-lg font-black text-white">{fullName || 'Not Provided'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] uppercase font-black text-gray-600 tracking-widest mb-1">Driving License</p>
                                                                <p className="text-lg font-mono text-white tracking-widest">{drivingLicenseNumber || 'Not Provided'}</p>
                                                            </div>
                                                            {secondaryIdType && (
                                                                <div>
                                                                    <p className="text-[10px] uppercase font-black text-gray-600 tracking-widest mb-1">Secondary ID ({secondaryIdType})</p>
                                                                    <p className="text-lg font-mono text-white tracking-widest">{secondaryIdNumber || 'Not Provided'}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-4 text-right">
                                                            <div>
                                                                <p className="text-[10px] uppercase font-black text-gray-600 tracking-widest mb-1">File Status</p>
                                                                <p className="text-sm font-black text-emerald-500">READY FOR UPLOAD</p>
                                                            </div>
                                                            <div className="flex justify-end gap-2">
                                                                {idFrontFile && <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg" title="ID Front"><FileCheck size={16} /></div>}
                                                                {idBackFile && <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg" title="ID Back"><FileCheck size={16} /></div>}
                                                                {selfieFile && <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg" title="Biometric"><User size={16} /></div>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-white/5 pt-6">
                                                        <p className="text-[10px] uppercase font-black text-gray-600 tracking-widest mb-2">Registered Address</p>
                                                        <p className="text-sm text-gray-300 leading-relaxed italic">{address || 'No address provided'}</p>
                                                    </div>

                                                    <div className="bg-gaming-accent/10 border border-gaming-accent/20 rounded-2xl p-4 flex gap-3">
                                                        <ShieldCheck className="text-gaming-accent shrink-0" size={20} />
                                                        <p className="text-[10px] text-gray-400 font-mono leading-relaxed uppercase tracking-wider">
                                                            Your documents will be manually verified by our team. This process ensures the highest level of security for our rental community.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Navigation */}
                                {!isSubmitted && (
                                    <div className="flex gap-4 pt-12">
                                        {step > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setStep(step - 1)}
                                                className="flex-1 py-4 bg-white/5 text-white font-black rounded-xl hover:bg-white/10 transition-all border border-white/10 uppercase tracking-widest text-xs"
                                            >
                                                Back
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={
                                                isSubmitting ||
                                                (
                                                    step === 2 &&
                                                    (
                                                        !idFrontFile ||
                                                        !idBackFile ||
                                                        !selfieVideoFile ||
                                                        !secondaryIdFrontFile ||
                                                        !secondaryIdBackFile ||
                                                        isRecording ||
                                                        isPreparingVideo ||
                                                        isFinalizingVideo
                                                    )
                                                )
                                            }
                                            className={`flex-[2] py-4 bg-gaming-accent text-white font-black rounded-xl shadow-[0_4px_30px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_40px_rgba(168,85,247,0.5)] transition-all transform hover:-translate-y-1 relative overflow-hidden group uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (step === 3 ? 'Confirm & Submit' : 'Continue')}
                                                {!isSubmitting && <ChevronRight size={18} />}
                                            </span>
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        </button>
                                    </div>
                                )}
                            </form>

                            {/* Footer */}
                            <div className="mt-12 text-center">
                                <p className="text-gaming-accent/40 text-[9px] font-black uppercase tracking-[0.3em]">
                                    Secure Manual Verification Process
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
