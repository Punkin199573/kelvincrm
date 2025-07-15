"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase, type Product } from "@/lib/supabase/client"

export function AdminProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    category: "apparel" as const,
    tier_visibility: ["frost_fan", "blizzard_vip", "avalanche_backstage"] as string[],
    in_stock: true,
    is_exclusive: false,
    sizes: [] as string[],
    colors: [] as string[],
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
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
    }
  }

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.from("products").insert([newProduct]).select().single()

      if (error) throw error

      setProducts([data, ...products])
      resetForm()
      setIsCreateDialogOpen(false)

      toast({
        title: "Success",
        description: "Product created successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct || !newProduct.name || !newProduct.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("products")
        .update(newProduct)
        .eq("id", editingProduct.id)
        .select()
        .single()

      if (error) throw error

      setProducts(products.map((p) => (p.id === editingProduct.id ? data : p)))
      resetForm()
      setEditingProduct(null)
      setIsCreateDialogOpen(false)

      toast({
        title: "Success",
        description: "Product updated successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      setProducts(products.filter((p) => p.id !== productId))

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      description: product.description || "",
      price: product.price,
      image_url: product.image_url || "",
      category: product.category,
      tier_visibility: product.tier_visibility,
      in_stock: product.in_stock,
      is_exclusive: product.is_exclusive,
      sizes: product.sizes,
      colors: product.colors,
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setNewProduct({
      name: "",
      description: "",
      price: 0,
      image_url: "",
      category: "apparel",
      tier_visibility: ["frost_fan", "blizzard_vip", "avalanche_backstage"],
      in_stock: true,
      is_exclusive: false,
      sizes: [],
      colors: [],
    })
    setEditingProduct(null)
  }

  const handleTierVisibilityChange = (tier: string, checked: boolean) => {
    if (checked) {
      setNewProduct({
        ...newProduct,
        tier_visibility: [...newProduct.tier_visibility, tier],
      })
    } else {
      setNewProduct({
        ...newProduct,
        tier_visibility: newProduct.tier_visibility.filter((t) => t !== tier),
      })
    }
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

  return (
    <div className="space-y-6">
      <Card className="border-fire-500/20 dark:border-ice-500/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-fire-600 dark:text-ice-400">Product Management</CardTitle>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-fire dark:bg-gradient-ice" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value: any) => setNewProduct({ ...newProduct, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apparel">Apparel</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="collectibles">Collectibles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Tier Visibility</Label>
                  <div className="flex gap-4">
                    {[
                      { id: "frost_fan", label: "Frost Fan" },
                      { id: "blizzard_vip", label: "Blizzard VIP" },
                      { id: "avalanche_backstage", label: "Avalanche Backstage" },
                    ].map((tier) => (
                      <div key={tier.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={tier.id}
                          checked={newProduct.tier_visibility.includes(tier.id)}
                          onCheckedChange={(checked) => handleTierVisibilityChange(tier.id, checked as boolean)}
                        />
                        <Label htmlFor={tier.id}>{tier.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in_stock"
                    checked={newProduct.in_stock}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, in_stock: checked as boolean })}
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_exclusive"
                    checked={newProduct.is_exclusive}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_exclusive: checked as boolean })}
                  />
                  <Label htmlFor="is_exclusive">Exclusive Item</Label>
                </div>
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
                  onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  disabled={isLoading}
                  className="bg-gradient-fire dark:bg-gradient-ice"
                >
                  {isLoading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tier Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{product.name}</div>
                      {product.is_exclusive && (
                        <Badge variant="outline" className="text-xs">
                          Exclusive
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {product.tier_visibility.map((tier) => getTierBadge(tier))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.in_stock ? "default" : "destructive"}>
                      {product.in_stock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
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

          {products.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No products found. Create your first product to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
