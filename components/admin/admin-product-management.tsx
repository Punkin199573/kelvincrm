"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Package, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase, type Product } from "@/lib/supabase/client"

export function AdminProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "apparel" as const,
    tier_visibility: [] as string[],
    in_stock: true,
    is_exclusive: false,
    sizes: [] as string[],
    colors: [] as string[],
  })

  const { toast } = useToast()

  const categories = [
    { value: "apparel", label: "Apparel" },
    { value: "accessories", label: "Accessories" },
    { value: "music", label: "Music" },
    { value: "collectibles", label: "Collectibles" },
  ]

  const tiers = [
    { value: "frost_fan", label: "Frost Fan" },
    { value: "blizzard_vip", label: "Blizzard VIP" },
    { value: "avalanche_backstage", label: "Avalanche Backstage" },
  ]

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"]
  const availableColors = ["Black", "White", "Gray", "Blue", "Red", "Green"]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Name and price are required",
        variant: "destructive",
      })
      return
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        image_url: formData.image_url,
        category: formData.category,
        tier_visibility: formData.tier_visibility,
        in_stock: formData.in_stock,
        is_exclusive: formData.is_exclusive,
        sizes: formData.sizes,
        colors: formData.colors,
      }

      if (editingProduct) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        const { error } = await supabase.from("products").insert([productData])

        if (error) throw error

        toast({
          title: "Success",
          description: "Product created successfully",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      category: product.category,
      tier_visibility: product.tier_visibility,
      in_stock: product.in_stock,
      is_exclusive: product.is_exclusive,
      sizes: product.sizes,
      colors: product.colors,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
      fetchProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "apparel",
      tier_visibility: [],
      in_stock: true,
      is_exclusive: false,
      sizes: [],
      colors: [],
    })
    setEditingProduct(null)
  }

  const handleTierToggle = (tier: string) => {
    setFormData((prev) => ({
      ...prev,
      tier_visibility: prev.tier_visibility.includes(tier)
        ? prev.tier_visibility.filter((t) => t !== tier)
        : [...prev.tier_visibility, tier],
    }))
  }

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }))
  }

  const handleColorToggle = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color) ? prev.colors.filter((c) => c !== color) : [...prev.colors, color],
    }))
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "frost_fan":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Frost Fan</Badge>
      case "blizzard_vip":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">Blizzard VIP</Badge>
      case "avalanche_backstage":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Avalanche Backstage</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card className="border-fire-500/20 dark:border-ice-500/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
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
          <CardTitle className="text-fire-600 dark:text-ice-400">Product Management</CardTitle>
          <CardDescription>Manage your merchandise store and inventory</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-fire dark:bg-gradient-ice">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update product details" : "Create a new product for your store"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, category: value }))}
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
                <Label>Tier Visibility</Label>
                <div className="flex flex-wrap gap-2">
                  {tiers.map((tier) => (
                    <div key={tier.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={tier.value}
                        checked={formData.tier_visibility.includes(tier.value)}
                        onCheckedChange={() => handleTierToggle(tier.value)}
                      />
                      <Label htmlFor={tier.value} className="text-sm">
                        {tier.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {formData.category === "apparel" && (
                <>
                  <div className="space-y-2">
                    <Label>Available Sizes</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                          <Checkbox
                            id={`size-${size}`}
                            checked={formData.sizes.includes(size)}
                            onCheckedChange={() => handleSizeToggle(size)}
                          />
                          <Label htmlFor={`size-${size}`} className="text-sm">
                            {size}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Available Colors</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox
                            id={`color-${color}`}
                            checked={formData.colors.includes(color)}
                            onCheckedChange={() => handleColorToggle(color)}
                          />
                          <Label htmlFor={`color-${color}`} className="text-sm">
                            {color}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, in_stock: !!checked }))}
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_exclusive"
                    checked={formData.is_exclusive}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_exclusive: !!checked }))}
                  />
                  <Label htmlFor="is_exclusive">Exclusive Item</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-fire dark:bg-gradient-ice">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border border-muted rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={product.in_stock ? "default" : "destructive"}>
                        {product.in_stock ? "In Stock" : "Out of Stock"}
                      </Badge>
                      {product.is_exclusive && <Badge className="bg-gold-500/20 text-gold-400">Exclusive</Badge>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{product.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {product.tier_visibility.map((tier) => (
                      <div key={tier}>{getTierBadge(tier)}</div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
              <p className="text-sm">Create your first product to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
