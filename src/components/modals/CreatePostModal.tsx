import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

export const CreatePostModal = () => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(filesArray);
      setPreviewUrls(filesArray.map(file => URL.createObjectURL(file)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast.error("Please select at least one image.");
      return;
    }
    // In a real app, you'd upload images and post data to a backend
    console.log('New post data:', { imageFiles, caption, location });
    toast.success("Post created successfully! (Mock)");
    // Reset form
    setImageFiles([]);
    setCaption('');
    setLocation('');
    setPreviewUrls([]);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Post</DialogTitle>
        <DialogDescription>
          Share your moments with the world.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="images">Images</Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="col-span-3"
          />
          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {previewUrls.map((url, index) => (
                <img key={index} src={url} alt={`Preview ${index}`} className="w-24 h-24 object-cover rounded-md" />
              ))}
            </div>
          )}
          {previewUrls.length === 0 && (
            <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-md text-muted-foreground">
              <ImagePlus className="h-8 w-8 mr-2" />
              <span>Upload images</span>
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Add location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="col-span-3"
          />
        </div>
        <Button type="submit" className="w-full">Share Post</Button>
      </form>
    </DialogContent>
  );
};