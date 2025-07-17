import { createUploadthing, type FileRouter } from "uploadthing/next"
import { supabase } from "@/lib/supabase/client"

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Image uploader for general use
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      // You can add authentication here if needed
      return { userId: "user" } // Whatever is returned here is accessible in onUploadComplete as `metadata`
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId)
      console.log("file url", file.url)

      // Save to Supabase images table
      try {
        const { error } = await supabase.from("images").insert({
          name: file.name,
          url: file.url,
          category: "general",
          upload_thing_key: file.key,
          file_size: file.size,
          alt_text: file.name,
        })

        if (error) {
          console.error("Error saving image to database:", error)
        }
      } catch (error) {
        console.error("Unexpected error saving image:", error)
      }

      return { uploadedBy: metadata.userId, url: file.url }
    }),

  // Product image uploader
  productImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      return { userId: "admin" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Product image upload complete:", file.url)
      return { uploadedBy: metadata.userId, url: file.url }
    }),

  // Content uploader for videos and audio
  contentUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "64MB", maxFileCount: 1 },
    audio: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      return { userId: "admin" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Content upload complete:", file.url)

      // Determine content type based on file type
      let contentType: "video" | "audio" | "image" = "image"
      if (file.type.startsWith("video/")) contentType = "video"
      else if (file.type.startsWith("audio/")) contentType = "audio"

      // Save to content table
      try {
        const { error } = await supabase.from("content").insert({
          title: file.name,
          content_type: contentType,
          content_url: file.url,
          file_size: file.size,
          required_tier: "frost_fan",
          is_published: false,
        })

        if (error) {
          console.error("Error saving content to database:", error)
        }
      } catch (error) {
        console.error("Unexpected error saving content:", error)
      }

      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
