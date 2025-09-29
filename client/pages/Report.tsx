import { useForm } from "react-hook-form";
import { useState } from "react";
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
      // console.log("Submitting with token:", token);
      const res = await fetch("http://localhost:5000/api/issues", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
    { label: "Pothole", value: "Pothole" },
    { label: "Garbage", value: "Garbage" },
    { label: "Streetlight", value: "Streetlight" },
    { label: "Water", value: "Water" },
    { label: "Other", value: "Other" },
  ];

  const priorityLevels = [
    { value: "Low", label: "Low Priority" },
    { value: "Medium", label: "Medium Priority" },
    { value: "High", label: "High Priority" },
    { value: "Critical", label: "Critical" },
  ];

  return (
    <Layout>
    <div className=" bg-[#111827] p-4 md:p-10 max-w-4xl mx-auto w-full rounded-2xl shadow-lg border border-white/10 mb-10">
        <div className="mb-12 text-center rounded">
          <h1 className="text-3xl  font-bold text-foreground mb-2">
            Report a Civic Issue
          </h1>
          <p className="text-muted-foreground">
            Help us keep our community clean and safe by reporting issues that
            need attention.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-civic-blue" />
                  Issue Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="issueTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description of the issue"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
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

                  {/* Priority */}
                  <FormField
                    control={form.control}
                    name="priorityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
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

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter street address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Landmark */}
                <FormField
                  control={form.control}
                  name="nearbyLandmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nearby Landmark{" "}
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Near City Hall" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the issue in detail..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Upload Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-civic-blue" />
                  Photos (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="photo-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span>{" "}
                          photos of the issue
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 10MB
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {file.name}
                          </p>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(index)}
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

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location on Map</CardTitle>
              </CardHeader>
              <CardContent>
                <MiniMap onLocationSelect={handleLocationSelect} />
                {selectedLocation && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Selected: Lat {selectedLocation.lat}, Lng {selectedLocation.lng}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedLocation(null);
                  setUploadedFiles([]);
                  setFileInputKey(prev => prev + 1);
                }}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                className="bg-civic-blue hover:bg-civic-blue-dark"
              >
                Submit Report
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default ReportIssue;