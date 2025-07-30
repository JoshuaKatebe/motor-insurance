"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  useForm,
  SubmitHandler,
  Controller,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  Car,
  Shield,
  Gauge,
  Calendar,
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
  Settings,
  FileText,
  Calculator,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Home,
  Bell,
  Menu,
  X,
  Info,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { calculatePremium } from '@/lib/premiumCalculator';
import { QuotesService } from '@/lib/quotesService';
import SideBar from '@/components/SideBar';

const quoteSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  registrationNumber: z.string().min(1),
  engineSize: z.string().min(1),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
  vehicleValue: z.coerce.number().positive(),
  color: z.string().min(1),
  chassisNumber: z.string().min(1),
  coverageType: z.enum(['third-party', 'comprehensive', 'fire-theft']),
  startDate: z.string().min(1),
  duration: z.coerce.number().int().positive().default(12),
  additionalDrivers: z.coerce.number().int().nonnegative().default(0),
  voluntaryExcess: z.coerce.number().int().nonnegative().default(0),
});

type QuoteFormInputs = z.infer<typeof quoteSchema>;

export default function QuotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [premium, setPremium] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [animateStep, setAnimateStep] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid },
    getValues
  } = useForm<QuoteFormInputs>({
    resolver: zodResolver(quoteSchema) as any,
    mode: 'onChange',
    defaultValues: {
      fuelType: 'petrol',
      coverageType: 'comprehensive',
      duration: 12,
      additionalDrivers: 0,
      voluntaryExcess: 0,
    },
  });

  // Field configurations with placeholders and help text
  const fieldConfig = {
    make: {
      placeholder: 'e.g., Toyota, Honda, Ford',
      helpText: 'Enter the manufacturer of your vehicle',
      icon: Car
    },
    model: {
      placeholder: 'e.g., Corolla, Civic, F-150',
      helpText: 'Enter the specific model of your vehicle',
      icon: Car
    },
    year: {
      placeholder: 'e.g., 2022',
      helpText: 'Manufacturing year of your vehicle',
      icon: Calendar
    },
    registrationNumber: {
      placeholder: 'e.g., ABC 123 GP',
      helpText: 'Your vehicle\'s license plate number',
      icon: FileText
    },
    engineSize: {
      placeholder: 'e.g., 1.8L, 2000cc',
      helpText: 'Engine capacity in liters or cc',
      icon: Gauge
    },
    vehicleValue: {
      placeholder: 'e.g., 150000',
      helpText: 'Current market value of your vehicle in Kwacha',
      icon: TrendingUp
    },
    color: {
      placeholder: 'e.g., Silver, Black, White',
      helpText: 'Primary color of your vehicle',
      icon: Sparkles
    },
    chassisNumber: {
      placeholder: 'e.g., JT2BG12K1Y0123456',
      helpText: 'VIN or chassis number (usually 17 characters)',
      icon: Settings
    },
    startDate: {
      placeholder: 'Select start date',
      helpText: 'When should your coverage begin?',
      icon: Calendar
    },
    duration: {
      placeholder: '12',
      helpText: 'Policy duration in months (usually 6 or 12)',
      icon: Calendar
    },
    additionalDrivers: {
      placeholder: '0',
      helpText: 'Number of additional drivers to be covered',
      icon: User
    },
    voluntaryExcess: {
      placeholder: '0',
      helpText: 'Amount you\'re willing to pay in case of a claim',
      icon: Shield
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Vehicle Information',
      description: 'Tell us about your vehicle',
      icon: Car,
      fields: ['make', 'model', 'year', 'registrationNumber']
    },
    {
      id: 2,
      title: 'Vehicle Details',
      description: 'More details about your car',
      icon: Settings,
      fields: ['engineSize', 'fuelType', 'vehicleValue', 'color', 'chassisNumber']
    },
    {
      id: 3,
      title: 'Coverage Options',
      description: 'Choose your protection',
      icon: Shield,
      fields: ['coverageType', 'startDate', 'duration']
    },
    {
      id: 4,
      title: 'Additional Options',
      description: 'Customize your policy',
      icon: FileText,
      fields: ['additionalDrivers', 'voluntaryExcess']
    },
    {
      id: 5,
      title: 'Review & Quote',
      description: 'Get your premium calculation',
      icon: Calculator,
      fields: []
    }
  ];

  const nextStep = async () => {
    const currentStepFields = steps[currentStep - 1].fields;
    const isStepValid = await trigger(currentStepFields as any);
    
    if (isStepValid) {
      setAnimateStep(true);
      setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
        setAnimateStep(false);
      }, 200);
    }
  };

  const prevStep = () => {
    setAnimateStep(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
      setAnimateStep(false);
    }, 200);
  };

  const onSubmit: SubmitHandler<QuoteFormInputs> = async (data) => {
    if (!user) {
      // Handle case where user is not logged in
      // You might want to redirect to a login page
      alert('You must be logged in to create a quote.');
      return;
    }

    try {
      setIsCalculating(true);

      const vehicleDetails = {
        make: data.make,
        model: data.model,
        year: data.year,
        registrationNumber: data.registrationNumber,
        engineSize: data.engineSize,
        fuelType: data.fuelType,
        vehicleValue: data.vehicleValue,
        color: data.color,
        chassisNumber: data.chassisNumber,
      };

      const coverageDetails = {
        coverageType: data.coverageType,
        startDate: data.startDate,
        duration: data.duration as 6 | 12,
        additionalDrivers: data.additionalDrivers,
        voluntaryExcess: data.voluntaryExcess,
      };

      const premiumCalculation = calculatePremium(vehicleDetails, coverageDetails);
      const totalPremium = premiumCalculation.totalPremium;

      const quoteData = {
        userId: user.uid,
        ...vehicleDetails,
        ...coverageDetails,
        premium: totalPremium,
        status: 'active' as const,
      };

      await QuotesService.createQuote(quoteData as any);

      setPremium(totalPremium);
      setCurrentStep(5); // Move to the review step
    } catch (error) {
      console.error('Error creating quote:', error);
      
    } finally {
      setIsCalculating(false);
    }
  };

return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <SideBar/>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
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
                  New Quote
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
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div className="relative">
                      {index < steps.length - 1 && (
                        <div className={`absolute left-1/2 top-1/2 w-full h-0.5 ${currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-300'}`}
                          style={{ 
                            left: '50%',
                            width: 'calc(100vw / ' + steps.length + ' - 60px)'
                          }}
                        />
                      )}
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        currentStep === step.id 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25' 
                          : currentStep > step.id
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-white border-2 border-slate-300'
                      }`}>
                        <step.icon className={`h-6 w-6 ${currentStep >= step.id ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${currentStep === step.id ? 'text-slate-900' : 'text-slate-500'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-400 hidden sm:block">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 transition-all duration-300 ${animateStep ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
              <div className="p-6 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{steps[currentStep - 1].title}</h2>
                    <p className="text-slate-600 mt-1">{steps[currentStep - 1].description}</p>
                  </div>
                  <div className="hidden sm:flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-slate-600">AI-Powered Quotes</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit as any)} className="p-6">
                {steps[currentStep - 1].fields.map((fieldName) => (
                  <div key={fieldName} className="mb-6">
                    <Controller
                      name={fieldName as any}
                      control={control}
                      render={({ field }) => (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700 flex items-center">
                              {fieldConfig[fieldName as keyof typeof fieldConfig]?.icon && (
                                <span className="mr-2">
                                  {(() => {
                                    const Icon = fieldConfig[fieldName as keyof typeof fieldConfig].icon;
                                    return <Icon className="h-4 w-4 text-slate-500" />;
                                  })()}
                                </span>
                              )}
                              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')}
                            </label>
                            {fieldConfig[fieldName as keyof typeof fieldConfig]?.helpText && (
                              <div className="relative group">
                                <HelpCircle 
                                  className="h-4 w-4 text-slate-400 cursor-help" 
                                  onMouseEnter={() => setShowTooltip(fieldName)}
                                  onMouseLeave={() => setShowTooltip(null)}
                                />
                                {showTooltip === fieldName && (
                                  <div className="absolute right-0 bottom-full mb-2 w-64 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                                    <div className="absolute bottom-[-4px] right-2 w-2 h-2 bg-slate-900 transform rotate-45"></div>
                                    {fieldConfig[fieldName as keyof typeof fieldConfig].helpText}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {fieldName === 'fuelType' ? (
                            <select {...field} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50">
                              <option value="petrol">Petrol</option>
                              <option value="diesel">Diesel</option>
                              <option value="electric">Electric</option>
                              <option value="hybrid">Hybrid</option>
                            </select>
                          ) : fieldName === 'coverageType' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {['comprehensive', 'third-party', 'fire-theft'].map((type) => (
                                <label
                                  key={type}
                                  className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    field.value === type
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    {...field}
                                    value={type}
                                    checked={field.value === type}
                                    className="sr-only"
                                    onChange={() => field.onChange(type)}
                                  />
                                  <Shield className={`h-8 w-8 mb-2 ${field.value === type ? 'text-blue-600' : 'text-slate-400'}`} />
                                  <span className={`text-sm font-medium ${field.value === type ? 'text-blue-900' : 'text-slate-700'}`}>
                                    {type === 'comprehensive' ? 'Comprehensive' : type === 'third-party' ? 'Third Party' : 'Fire & Theft'}
                                  </span>
                                </label>
                              ))}
                            </div>
                          ) : fieldName === 'year' ? (
                            <input 
                              {...field} 
                              type="number" 
                              min="1900" 
                              max={new Date().getFullYear() + 1} 
                              placeholder={fieldConfig[fieldName as keyof typeof fieldConfig]?.placeholder}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50" 
                            />
                          ) : fieldName === 'vehicleValue' || fieldName === 'duration' || fieldName === 'additionalDrivers' || fieldName === 'voluntaryExcess' ? (
                            <input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder={fieldConfig[fieldName as keyof typeof fieldConfig]?.placeholder}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50" 
                            />
                          ) : fieldName === 'startDate' ? (
                            <input 
                              {...field} 
                              type="date" 
                              min={new Date().toISOString().split('T')[0]} 
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50" 
                            />
                          ) : (
                            <input 
                              {...field} 
                              type="text" 
                              placeholder={fieldConfig[fieldName as keyof typeof fieldConfig]?.placeholder}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50" 
                            />
                          )}
                          {errors[fieldName as keyof QuoteFormInputs] && (
                            <p className="mt-1 text-sm text-red-600">{errors[fieldName as keyof QuoteFormInputs]?.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                ))}

                {currentStep === 5 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
                    {isCalculating ? (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-pulse"></div>
                          <Calculator className="absolute inset-0 m-auto h-10 w-10 text-white" />
                        </div>
                        <p className="text-lg font-medium text-slate-700">Calculating your premium...</p>
                      </div>
                    ) : premium ? (
                      <div className="text-center">
                        <div className="mb-6">
                          <p className="text-sm font-medium text-slate-600 mb-2">Your Estimated Premium</p>
                          <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            K{premium.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-500 mt-2">per year</p>
                        </div>
                        <div className="space-y-3 text-left bg-white/50 p-6 rounded-xl">
                          <h3 className="font-semibold text-slate-900 mb-3">Coverage Summary</h3>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Vehicle:</span>
                            <span className="font-medium text-slate-900">{watch('make')} {watch('model')} ({watch('year')})</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Coverage Type:</span>
                            <span className="font-medium text-slate-900">{watch('coverageType')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Start Date:</span>
                            <span className="font-medium text-slate-900">{new Date(watch('startDate')).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
          
                <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                  {currentStep > 1 && (
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      className="flex items-center px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" /> 
                      Previous
                    </button>
                  )}
                  <div className="ml-auto">
                    {currentStep < steps.length ? (
                      <button 
                        type="button" 
                        onClick={nextStep} 
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        Next Step
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </button>
                    ) : !premium ? (
                      <button 
                        type="submit" 
                        disabled={isCalculating}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCalculating ? 'Calculating...' : 'Calculate Premium'}
                        <Calculator className="h-5 w-5 ml-2" />
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => router.push('/quotes')}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        Proceed to Purchase
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
