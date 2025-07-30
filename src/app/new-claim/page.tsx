
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  CheckCircle,
  UploadCloud,
  X,
  Loader2,
  ShieldCheck,
  Car,
  Menu,
  Bell
} from 'lucide-react';
import { ClaimsService } from '@/lib/claimsService';
import { PoliciesService, Policy } from '@/lib/policiesService';
import SideBar from '@/components/SideBar';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Timestamp } from 'firebase/firestore';

const claimSchema = z.object({
  policyId: z.string().min(1, 'Please select a policy'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  incidentType: z.enum(['accident', 'theft', 'fire', 'vandalism', 'natural-disaster', 'other']),
  incidentDescription: z.string().min(20, 'Please provide a detailed description (min. 20 characters)'),
  estimatedAmount: z.coerce.number().positive('Please enter a valid estimated amount'),
  images: z.array(z.any()).optional(),
});

type ClaimFormInputs = z.infer<typeof claimSchema>;

export default function NewClaimPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ClaimFormInputs>({
    resolver: zodResolver(claimSchema),
    mode: 'onChange',
    defaultValues: {
      incidentType: 'accident',
      images: [],
    },
  });

  useEffect(() => {
    if (user) {
      const fetchPolicies = async () => {
        try {
          const userPolicies = await PoliciesService.getActiveUserPolicies(user.uid);
          setPolicies(userPolicies);
        } catch (error) {
          console.error('Failed to fetch policies:', error);
        } finally {
          setLoadingPolicies(false);
        }
      };
      fetchPolicies();
    } else {
      router.push('/login');
    }
  }, [user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    const currentImages = watch('images') || [];
    // @ts-ignore
    control._formValues.images = [...currentImages, ...files];
  };

  const removeImage = (index: number) => {
    const currentImages = watch('images') || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    // @ts-ignore
    control._formValues.images = newImages;
    setImagePreviews(newPreviews);
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const imageUrls: string[] = [];
    for (const file of files) {
      const storageRef = ref(storage, `claims/${user!.uid}/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          },
          (error) => {
            console.error("Upload failed:", error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            imageUrls.push(downloadURL);
            resolve();
          }
        );
      });
    }
    return imageUrls;
  };

  const onSubmit: SubmitHandler<ClaimFormInputs> = async (data) => {
    if (!user) {
      alert('You must be logged in to file a claim.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];
      const imageFiles = watch('images');
      if (imageFiles && imageFiles.length > 0) {
        imageUrls = await uploadImages(imageFiles);
      }
      
      const incidentDate = new Date(data.incidentDate);

      const claimData = {
        userId: user.uid,
        policyId: data.policyId,
        incidentDate: Timestamp.fromDate(incidentDate),
        incidentType: data.incidentType,
        incidentDescription: data.incidentDescription,
        estimatedAmount: data.estimatedAmount,
        imageUrls,
        status: 'submitted' as const,
      };

      // @ts-ignore
      await ClaimsService.createClaim(claimData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating claim:', error);
      alert('Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:pl-64">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent lg:ml-0">
                  New Claim
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="h-6 w-6 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="text-sm text-slate-600 hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6 border-b border-slate-200/60">
                <h2 className="text-xl font-bold text-slate-900">Incident Details</h2>
                <p className="text-slate-600 mt-1">Provide information about the incident.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Policy Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2 text-slate-500" />
                      Select Policy
                    </label>
                    <Controller
                      name="policyId"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50"
                          disabled={loadingPolicies}
                        >
                          <option value="">{loadingPolicies ? 'Loading policies...' : 'Select a policy'}</option>
                          {policies.map(policy => (
                            <option key={policy.id} value={policy.id}>
                              {policy.policyNumber} - {policy.vehicleInfo}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.policyId && <p className="mt-1 text-sm text-red-600">{errors.policyId.message}</p>}
                  </div>

                  {/* Incident Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                      Date of Incident
                    </label>
                    <Controller
                      name="incidentDate"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="date"
                          {...field}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50"
                        />
                      )}
                    />
                    {errors.incidentDate && <p className="mt-1 text-sm text-red-600">{errors.incidentDate.message}</p>}
                  </div>

                  {/* Incident Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-slate-500" />
                      Incident Type
                    </label>
                    <Controller
                      name="incidentType"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50"
                        >
                          <option value="accident">Accident</option>
                          <option value="theft">Theft</option>
                          <option value="fire">Fire</option>
                          <option value="vandalism">Vandalism</option>
                          <option value="natural-disaster">Natural Disaster</option>
                          <option value="other">Other</option>
                        </select>
                      )}
                    />
                  </div>

                  {/* Incident Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-slate-500" />
                      Description of Incident
                    </label>
                    <Controller
                      name="incidentDescription"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={4}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50"
                          placeholder="Describe what happened in detail..."
                        />
                      )}
                    />
                    {errors.incidentDescription && <p className="mt-1 text-sm text-red-600">{errors.incidentDescription.message}</p>}
                  </div>
                  
                  {/* Estimated Amount */}
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-slate-500" />
                      Estimated Cost of Damages (K)
                    </label>
                    <Controller
                      name="estimatedAmount"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          {...field}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50"
                           placeholder="e.g., 5000"
                        />
                      )}
                    />
                    {errors.estimatedAmount && <p className="mt-1 text-sm text-red-600">{errors.estimatedAmount.message}</p>}
                  </div>

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2 text-slate-500" />
                      Upload Photos
                    </label>
                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl">
                      <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload files</span>
                            <input id="file-upload" name="images" type="file" className="sr-only" multiple onChange={handleImageChange} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreviews.map((src, index) => (
                        <div key={index} className="relative group">
                          <img src={src} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {uploadProgress[watch('images')[index]?.name] &&
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 rounded-b-lg">
                              <div
                                className="h-1 bg-blue-600 rounded-b-lg"
                                style={{ width: `${uploadProgress[watch('images')[index].name]}%` }}
                              ></div>
                            </div>
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-200 mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                    {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


