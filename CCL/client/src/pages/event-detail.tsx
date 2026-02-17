import { useEvent, useUploadMedia } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useRoute } from "wouter";
import { format } from "date-fns";
import { useRef } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Upload, Image as ImageIcon, Download, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const eventId = parseInt(params?.id || "0");
  const { data: event, isLoading } = useEvent(eventId);
  const { user } = useAuth();
  const uploadMedia = useUploadMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      uploadMedia.mutate({ eventId, formData });
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) return <div className="text-center py-20">Event not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Link href="/">
        <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Button>
      </Link>

      {/* Header Section */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90 mix-blend-multiply opacity-90" />
        {/* Abstract background pattern */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale" />
        
        <div className="relative z-10 p-8 md:p-12 lg:p-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4 max-w-2xl">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                {format(new Date(event.date), "EEEE, MMMM do, yyyy")}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight leading-tight">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-slate-200 pt-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-foreground/70" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-foreground/70" />
                  Created by ID #{event.createdById}
                </div>
              </div>
            </div>
            
            {user && (
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 min-w-[200px]">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">Actions</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMedia.isPending}
                  >
                    {uploadMedia.isPending ? (
                      "Uploading..."
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Description */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">About Event</h3>
              <p className="text-slate-600 leading-relaxed">
                {event.description}
              </p>
            </CardContent>
          </Card>
          
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="font-semibold text-primary mb-2">Cloud Storage</h3>
            <p className="text-sm text-slate-600">
              All media is securely stored in the cloud. You can download original quality photos and videos shared by attendees.
            </p>
          </div>
        </div>

        {/* Right Column: Gallery */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display">Media Gallery</h2>
            <Badge variant="outline" className="px-3 py-1">
              {event.media.length} items
            </Badge>
          </div>

          {event.media.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <div className="bg-white w-16 h-16 rounded-full shadow-sm mx-auto flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No media yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                Be the first to share photos or videos from this event.
              </p>
              {user && (
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Now
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {event.media.map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-sm hover:shadow-lg transition-all">
                  {item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      className="w-full h-full object-cover"
                      controls={false} 
                    />
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.filename} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a 
                      href={item.url} 
                      download={item.filename} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white text-slate-900 font-medium">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </a>
                  </div>
                  
                  {item.type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
                      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
