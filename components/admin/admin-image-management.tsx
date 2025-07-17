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
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ImageIcon, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase, type Image } from "@/lib/supabase/client"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/lib/uploadthing"

const categories = [
  { value: "homepage", label: "Homepage", description: "Hero sections, banners, featured images" },
  { value: "events", label: "Events", description: "Event banners, gallery images" },
  { value: "store", label: "Store", description: "Product images, store banners" },
  { value: "community", label: "Community", description: "Community page images" },
  { value: "content", label: "Content", description: "Video thumbnails, content images" },
  { value: "general", label: "General", description: "Miscellaneous images" },
]

export function AdminImageManagement() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    category: "homepage",
    alt_text: "",
    upload_thing_key: "",
  })
  const [uploading, setUploading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      let query = supabase.from("images").select("*").eq("is_active", true).order("created_at", { ascending: false })

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory)
      }

      const { data, error } = await query

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
        alt_text: formData.alt_text || formData.name,
        upload_thing_key: formData.upload_thing_key,
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
      upload_thing_key: image.upload_thing_key || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const { error } = await supabase.from("images").update({ is_active: false }).eq("id", imageId)

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
      upload_thing_key: "",
    })
    setEditingImage(null)
  }

  const filteredImages = images.filter((image) => selectedCategory === "all" || image.category === selectedCategory)

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-video bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-primary">Image Management</CardTitle>
            <CardDescription>Manage images across your website with UploadThing integration</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-gradient-to-r from-primary to-primary/80">
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingImage ? "Edit Image" : "Add New Image"}</DialogTitle>
                <DialogDescription>
                  {editingImage ? "Update image details" : "Upload or add a new image to your website"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* UploadThing Upload */}
                <div className="space-y-4">
                  <Label>Upload New Image</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <UploadButton<OurFileRouter, "imageUploader">
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]) {
                          setFormData((prev) => ({
                            ...prev,
                            url: res[0].url,
                            upload_thing_key: res[0].key,
                            name: prev.name || res[0].name,
                          }))
                          toast({
                            title: "Success",
                            description: "Image uploaded successfully",
                          })
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast({
                          title: "Upload Error",
                          description: error.message,
                          variant: "destructive",
                        })
                      }}
                      appearance={{
                        button: "bg-primary hover:bg-primary/90 text-primary-foreground",
                        allowedContent: "text-muted-foreground text-sm",
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Or enter an image URL manually below</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div>
                              <div className="font-medium">{category.label}</div>
                              <div className="text-xs text-muted-foreground">{category.description}</div>
                            </div>
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
                </div>

                {formData.url && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                      <img
                        src={formData.url || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80">
                    {editingImage ? "Update Image" : "Add Image"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        {/* Category Filter */}
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory("all")
                fetchImages()
              }}
            >
              All ({images.length})
            </Button>
            {categories.map((category) => {
              const count = images.filter((img) => img.category === category.value).length
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category.value)
                    fetchImages()
                  }}
                >
                  {category.label} ({count})
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.length > 0 ? (
              filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-video bg-muted rounded-lg overflow-hidden border hover:border-primary/50 transition-colors"
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt_text || image.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />

                  {/* Overlay */}
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

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-2">
                    <div className="font-medium text-sm truncate">{image.name}</div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {image.category}
                      </Badge>
                      {image.upload_thing_key && (
                        <Badge variant="outline" className="text-xs">
                          UploadThing
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No images found</h3>
                <p className="text-sm mb-4">
                  {selectedCategory === "all"
                    ? "Upload your first image to get started"
                    : `No images in the ${categories.find((c) => c.value === selectedCategory)?.label} category`}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
