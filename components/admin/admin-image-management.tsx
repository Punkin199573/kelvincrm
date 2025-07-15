"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, ImageIcon, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase, type Image } from "@/lib/supabase/client"

export function AdminImageManagement() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    category: "homepage",
    alt_text: "",
  })
  const [uploading, setUploading] = useState(false)

  const { toast } = useToast()

  const categories = [
    { value: "homepage", label: "Homepage" },
    { value: "events", label: "Events Page" },
    { value: "store", label: "Store" },
    { value: "community", label: "Community" },
    { value: "general", label: "General" },
  ]

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("images").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error("Error fetching images:", error)
      toast({
        title: "Error",
        description: "Failed to fetch images",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath)

      setFormData((prev) => ({
        ...prev,
        url: publicUrl,
        name: prev.name || file.name.split(".")[0],
      }))

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.url) {
      toast({
        title: "Validation Error",
        description: "Name and URL are required",
        variant: "destructive",
      })
      return
    }

    try {
      const imageData = {
        name: formData.name,
        url: formData.url,
        category: formData.category,
        alt_text: formData.alt_text,
      }

      if (editingImage) {
        const { error } = await supabase.from("images").update(imageData).eq("id", editingImage.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Image updated successfully",
        })
      } else {
        const { error } = await supabase.from("images").insert([imageData])

        if (error) throw error

        toast({
          title: "Success",
          description: "Image added successfully",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchImages()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save image",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (image: Image) => {
    setEditingImage(image)
    setFormData({
      name: image.name,
      url: image.url,
      category: image.category,
      alt_text: image.alt_text || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const { error } = await supabase.from("images").delete().eq("id", imageId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Image deleted successfully",
      })
      fetchImages()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      category: "homepage",
      alt_text: "",
    })
    setEditingImage(null)
  }

  if (loading) {
    return (
      <Card className="border-fire-500/20 dark:border-ice-500/20">
        <CardContent className="p-6">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-video bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-fire-500/20 dark:border-ice-500/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-fire-600 dark:text-ice-400">Image Management</CardTitle>
          <CardDescription>Manage images across your website</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-fire dark:bg-gradient-ice">
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingImage ? "Edit Image" : "Add New Image"}</DialogTitle>
              <DialogDescription>
                {editingImage ? "Update image details" : "Upload or add a new image"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && <div className="text-sm text-muted-foreground">Uploading...</div>}
                </div>
              </div>

              <div className="text-center text-muted-foreground">or</div>

              <div className="space-y-2">
                <Label htmlFor="url">Image URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Image Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter image name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt_text">Alt Text</Label>
                <Input
                  id="alt_text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="Describe the image for accessibility"
                />
              </div>

              {formData.url && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={formData.url || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-fire dark:bg-gradient-ice">
                  {editingImage ? "Update Image" : "Add Image"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.length > 0 ? (
            images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-video bg-muted rounded-lg overflow-hidden border hover:border-electric-500/50 transition-colors"
              >
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt_text || image.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => window.open(image.url, "_blank")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(image)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(image.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-2">
                  <div className="font-medium text-sm truncate">{image.name}</div>
                  <div className="text-xs text-gray-300 capitalize">{image.category}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No images found</p>
              <p className="text-sm">Upload your first image to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
