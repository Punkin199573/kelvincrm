"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Upload, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase, type ImageAsset } from "@/lib/supabase/client"
import Image from "next/image"

export function AdminImageManagement() {
  const [images, setImages] = useState<ImageAsset[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<ImageAsset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newImage, setNewImage] = useState({
    name: "",
    url: "",
    category: "homepage",
    alt_text: "",
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
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
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("assets").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("assets").getPublicUrl(filePath)

      setNewImage({ ...newImage, url: data.publicUrl })

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleCreateImage = async () => {
    if (!newImage.name || !newImage.url || !newImage.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.from("images").insert([newImage]).select().single()

      if (error) throw error

      setImages([data, ...images])
      resetForm()
      setIsCreateDialogOpen(false)

      toast({
        title: "Success",
        description: "Image created successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create image",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateImage = async () => {
    if (!editingImage || !newImage.name || !newImage.url || !newImage.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.from("images").update(newImage).eq("id", editingImage.id).select().single()

      if (error) throw error

      setImages(images.map((img) => (img.id === editingImage.id ? data : img)))
      resetForm()
      setEditingImage(null)
      setIsCreateDialogOpen(false)

      toast({
        title: "Success",
        description: "Image updated successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update image",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const { error } = await supabase.from("images").delete().eq("id", imageId)

      if (error) throw error

      setImages(images.filter((img) => img.id !== imageId))

      toast({
        title: "Success",
        description: "Image deleted successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const handleEditImage = (image: ImageAsset) => {
    setEditingImage(image)
    setNewImage({
      name: image.name,
      url: image.url,
      category: image.category,
      alt_text: image.alt_text || "",
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setNewImage({
      name: "",
      url: "",
      category: "homepage",
      alt_text: "",
    })
    setEditingImage(null)
  }

  return (
    <div className="space-y-6">
      <Card className="border-fire-500/20 dark:border-ice-500/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-fire-600 dark:text-ice-400">Image Management</CardTitle>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-fire dark:bg-gradient-ice" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingImage ? "Edit Image" : "Add New Image"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Image Name *</Label>
                  <Input
                    id="name"
                    value={newImage.name}
                    onChange={(e) => setNewImage({ ...newImage, name: e.target.value })}
                    placeholder="Enter image name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newImage.category}
                    onValueChange={(value) => setNewImage({ ...newImage, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage">Homepage</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="store">Store</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                    <Button type="button" variant="outline" disabled={uploading} className="shrink-0 bg-transparent">
                      {uploading ? (
                        "Uploading..."
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Image URL *</Label>
                  <Input
                    id="url"
                    value={newImage.url}
                    onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                    placeholder="https://example.com/image.jpg or upload above"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alt_text">Alt Text</Label>
                  <Input
                    id="alt_text"
                    value={newImage.alt_text}
                    onChange={(e) => setNewImage({ ...newImage, alt_text: e.target.value })}
                    placeholder="Describe the image for accessibility"
                  />
                </div>

                {newImage.url && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                      <Image
                        src={newImage.url || "/placeholder.svg"}
                        alt={newImage.alt_text || "Preview"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingImage ? handleUpdateImage : handleCreateImage}
                  disabled={isLoading}
                  className="bg-gradient-fire dark:bg-gradient-ice"
                >
                  {isLoading ? "Saving..." : editingImage ? "Update Image" : "Add Image"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Alt Text</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.map((image) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <div className="relative w-16 h-16 border rounded overflow-hidden">
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={image.alt_text || image.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{image.name}</TableCell>
                  <TableCell className="capitalize">{image.category}</TableCell>
                  <TableCell className="max-w-xs truncate">{image.alt_text || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditImage(image)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteImage(image.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {images.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No images found. Add your first image to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
