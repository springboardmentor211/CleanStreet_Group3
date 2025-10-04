import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import MapComponent from "@/components/MapComponent";
import { Upload, Camera, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {Layout} from "@/components/Layout"; // Use the same layout as other pages
import { useI18n } from "@/lib/i18n-context";

import MiniMap from "../components/MiniMap";
const issueTypeEnum = [
  "Pothole",
  "Garbage",
  "Streetlight",
  "Water",
  "Other",
] as const;

const priorityEnum = ["Low", "Medium", "High", "Critical"] as const;

const formSchema = z.object({
  issueTitle: z.string().min(1, "Issue title is required"),
  category: z.enum(issueTypeEnum, { errorMap: () => ({ message: "Category is required" }) }),
  priorityLevel: z.enum(priorityEnum, { errorMap: () => ({ message: "Priority level is required" }) }),
  address: z.string().min(1, "Address is required"),
  nearbyLandmark: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

const ReportIssue = () => {
  const { t } = useI18n();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issueTitle: "",
      category: undefined,
      priorityLevel: undefined,
      address: "",
      nearbyLandmark: "",
      description: "",
    },
  });

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    address: string;
  }) => {
  // console.log("Location selected:", location);
  setSelectedLocation(location);
  form.setValue("address", location.address);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    // console.log("Files selected:", files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isValidType) toast.error(`${file.name} is not an image.`);
      if (!isValidSize) toast.error(`${file.name} exceeds 10MB.`);
      return isValidType && isValidSize;
    });
    setUploadedFiles(prev => [...prev, ...validFiles]);
    if (validFiles.length)
      toast.success(`${validFiles.length} file(s) uploaded successfully!`);
    // console.log("Valid files:", validFiles);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        URL.revokeObjectURL(url);
      });
    };
  }, [uploadedFiles]);

  const onSubmit = async (data: FormData) => {
    try {
      // console.log("Form data before submit:", data);
      const formData = new FormData();
      formData.append("title", data.issueTitle);
      formData.append("category", data.category);
      formData.append("priority", data.priorityLevel); // backend expects 'priority'
      formData.append("description", data.description);
      formData.append("address", data.address); // address as top-level field
      // location GeoJSON object (no address inside)
      if (selectedLocation) {
        const locationGeo = { type: "Point", coordinates: [selectedLocation.lng, selectedLocation.lat] };
        // console.log("Location GeoJSON to send:", locationGeo);
        formData.append("location", JSON.stringify(locationGeo));
      }
      uploadedFiles.forEach(file => {
        formData.append("images", file);
      });
      // console.log("FormData to send:");
      // for (let pair of formData.entries()) {
      //   // console.log(pair[0], pair[1]);
      // }

      const token = window.localStorage.getItem("authToken");
      console.log("Submitting with token:", token ? `${token.substring(0, 20)}...` : 'No token');
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0], typeof pair[1] === 'object' ? 'File object' : pair[1]);
      }
      
      const res = await fetch("http://localhost:5000/api/issues", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        // Don't set Content-Type when using FormData - let browser set it with boundary
      });

      // console.log("Response status:", res.status);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error response from backend:", errorData);
        throw new Error(errorData.message || "Failed to submit issue");
      }

      toast.success("Issue reported successfully!");
      form.reset();
      setSelectedLocation(null);
      setUploadedFiles([]);
      setFileInputKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "Error reporting issue. Please try again.");
    }
  };

  const issueTypes = [
    { label: t('pothole'), value: "Pothole" },
    { label: t('garbage'), value: "Garbage" },
    { label: t('streetlight'), value: "Streetlight" },
    { label: t('water'), value: "Water" },
    { label: t('other'), value: "Other" },
  ];

  const priorityLevels = [
    { value: "Low", label: t('lowPriority') },
    { value: "Medium", label: t('mediumPriority') },
    { value: "High", label: t('highPriority') },
    { value: "Critical", label: t('criticalPriority') },
  ];

  return (
    <Layout>
    <div className=" bg-[#111827] p-4 md:p-10 max-w-[80%] mx-auto w-full rounded-2xl shadow-lg border border-white/10 mb-10">
        <div className="mb-12 text-center rounded">
          <h1 className="text-3xl  font-bold text-foreground mb-2">
            {t('reportACivicIssue')}
          </h1>
          <p className="text-muted-foreground">
            {t('helpKeepCommunityClean')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Left Column - Issue Details (spans 2 columns) */}
              <div className="xl:col-span-2 space-y-8">
                <Card className="transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <AlertTriangle className="h-6 w-6 text-civic-blue" />
                      {t('issueDetails')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                {/* First Row - Title spans full width */}
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="issueTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">{t('issueTitle')}</FormLabel>
                        <FormControl>
                          <Input
                            className="border-2 border-gray-600 focus:border-blue-400 focus-visible:ring-blue-500/20 bg-gray-800 text-white h-12 text-lg placeholder:text-gray-400"
                            placeholder={t('briefDescriptionPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Second Row - Category, Priority, and Address in 3 columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('category')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-2 border-gray-600 focus:border-blue-400 focus:ring-blue-500/20 bg-gray-800 text-white h-12">
                              <SelectValue placeholder={t('selectCategory')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {issueTypes.map(type => (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                              >
                                  {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priorityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('priority')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-2 border-gray-600 focus:border-blue-400 focus:ring-blue-500/20 bg-gray-800 text-white h-12">
                              <SelectValue placeholder={t('selectPriority')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorityLevels.map(level => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nearbyLandmark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('nearbyLandmark')}{" "}
                          <span className="text-muted-foreground">
                            ({t('optional')})
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            className="border-2 border-gray-600 focus:border-blue-400 focus-visible:ring-blue-500/20 bg-gray-800 text-white h-12 placeholder:text-gray-400 xl:col-span-2"
                            placeholder={t('nearbyLandmarkPlaceholder')} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Third Row - Address spans full width */}
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('address')}</FormLabel>
                        <FormControl>
                          <Input
                            className="border-2 border-gray-600 focus:border-blue-400 focus-visible:ring-blue-500/20 bg-gray-800 text-white h-12 placeholder:text-gray-400"
                            placeholder={t('enterStreetAddress')}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          {t('addressSearchInstructions')}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fourth Row - Description spans full width */}
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('description')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('describeIssueDetail')}
                            className="min-h-[120px] border-2 border-gray-600 focus:border-blue-400 focus-visible:ring-blue-500/20 bg-gray-800 text-white resize-none placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                  </CardContent>
                </Card>

              </div>

              {/* Right Column - Location and Actions */}
              <div className="xl:col-span-2 space-y-8">
                <Card className="transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 border-2">
                  <CardHeader>
                    <CardTitle className="text-xl">{t('locationOnMap')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MiniMap 
                      onLocationSelect={handleLocationSelect} 
                      searchAddress={form.watch("address")}
                    />
                    {selectedLocation && (
                      <div className="mt-4 p-3 bg-gray-700 border border-blue-500 rounded-lg">
                        <p className="text-sm font-medium text-blue-300">{t('selectedLocation')}</p>
                        <p className="text-xs text-blue-200">
                          Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upload Photos */}
                <Card className="transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Camera className="h-6 w-6 text-civic-blue" />
                      {t('photosOptional')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <Label
                          htmlFor="photo-upload"
                          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-500 hover:border-blue-400 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-all duration-200 bg-gray-800/50"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-base text-muted-foreground">
                              <span className="font-semibold">{t('clickToUpload')}</span>{" "}
                              {t('uploadPhotosDesc')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t('fileTypes')}
                            </p>
                          </div>
                          <Input
                            key={fileInputKey}
                            id="photo-upload"
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            aria-label="Upload photos"
                          />
                        </Label>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-blue-400 transition-colors">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onLoad={(e) => {
                                    // Revoke the URL after the image loads to free memory
                                    const img = e.target as HTMLImageElement;
                                    const cleanup = () => {
                                      URL.revokeObjectURL(img.src);
                                      img.removeEventListener('load', cleanup);
                                    };
                                    // Set a delay to ensure the image is fully rendered
                                    setTimeout(cleanup, 1000);
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-300 mt-2 truncate text-center">
                                {file.name}
                              </p>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-red-600 hover:bg-red-700 border-2 border-white shadow-lg"
                                onClick={() => removeFile(index)}
                                title="Remove image"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
              </div>
            </div>

            {/* Action Buttons - Bottom Left */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-600">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-8 text-lg border-2 border-gray-500 hover:border-gray-400 bg-gray-800 text-white hover:bg-gray-700"
                onClick={() => {
                  form.reset();
                  setSelectedLocation(null);
                  setUploadedFiles([]);
                  setFileInputKey(prev => prev + 1);
                }}
              >
                {t('clearForm')}
              </Button>
              <Button
                type="submit"
                className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700"
              >
                {t('submitReport')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default ReportIssue;