import { useState } from "react";
import { useForm } from "react-hook-form";
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

const issueTypeEnum = [
  "potholes",
  "broken-streetlight",
  "illegal-dumping",
  "graffiti",
  "damaged-signage",
  "tree-branch-issues",
  "water-leak",
  "other",
] as const;

const priorityEnum = ["low", "medium", "high", "emergency"] as const;

const formSchema = z.object({
  issueTitle: z.string().min(1, "Issue title is required"),
  issueType: z.enum(issueTypeEnum, { errorMap: () => ({ message: "Issue type is required" }) }),
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
      issueType: undefined,
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
    setSelectedLocation(location);
    form.setValue("address", location.address);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
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
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.issueTitle);
      formData.append("type", data.issueType);
      formData.append("priority", data.priorityLevel);
      formData.append("address", data.address);
      if (data.nearbyLandmark) formData.append("landmark", data.nearbyLandmark);
      formData.append("description", data.description);

      if (selectedLocation) {
        formData.append("latitude", selectedLocation.lat.toString());
        formData.append("longitude", selectedLocation.lng.toString());
      }

      uploadedFiles.forEach(file => {
        formData.append("files", file);
      });

      const res = await fetch("http://localhost:5000/api/issues", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit issue");
      }

      toast.success("Issue reported successfully!");
      form.reset();
      setSelectedLocation(null);
      setUploadedFiles([]);
      setFileInputKey(prev => prev + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error reporting issue. Please try again.");
    }
  };

  const issueTypes = [
    { label: "Potholes", value: "potholes" },
    { label: "Broken Streetlight", value: "broken-streetlight" },
    { label: "Illegal Dumping", value: "illegal-dumping" },
    { label: "Graffiti", value: "graffiti" },
    { label: "Damaged Signage", value: "damaged-signage" },
    { label: "Tree/Branch Issues", value: "tree-branch-issues" },
    { label: "Water Leak", value: "water-leak" },
    { label: "Other", value: "other" },
  ];

  const priorityLevels = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" },
    { value: "emergency", label: "Emergency" },
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

                  {/* Type */}
                  <FormField
                    control={form.control}
                    name="issueType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select issue type" />
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
                <MapComponent onLocationSelect={handleLocationSelect} />
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