import { createUploadthing, type FileRouter } from "uploadthing/next"
import { supabase } from "@/lib/supabase/client"

const f = createUploadthing()

export const ourFileRouter = {
  // Profile image uploader
  profileImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return { userId: "user", category: "profile" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile image upload complete:", file.url)

      try {
        const { error } = await supabase.from("images").insert({
          name: file.name,
          url: file.url,
          category: metadata.category,
          upload_thing_key: file.key,
          file_size: file.size,
          alt_text: file.name,
          user_id: metadata.userId,
          is_active: true,
        })

        if (error) {
          console.error("Error saving profile image to database:", error)
        }
      } catch (error) {
        console.error("Unexpected error saving profile image:", error)
      }

      return { uploadedBy: metadata.userId, url: file.url }
    }),

  // Website image uploader (for admin)
  websiteImageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      return { userId: "admin", category: "website" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Website image upload complete:", file.url)

      try {
        const { error } = await supabase.from("images").insert({
          name: file.name,
          url: file.url,
          category: metadata.category,
          upload_thing_key: file.key,
          file_size: file.size,
          alt_text: file.name,
          user_id: metadata.userId,
          is_active: true,
        })

        if (error) {
          console.error("Error saving website image to database:", error)
        }
      } catch (error) {
        console.error("Unexpected error saving website image:", error)
      }

      return { uploadedBy: metadata.userId, url: file.url }
    }),

  // Content uploader (videos, audio, images)
  contentUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "64MB", maxFileCount: 1 },
    audio: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      return { userId: "admin", category: "content" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Content upload complete:", file.url)

      try {
        let contentType: "video" | "audio" | "image" = "image"
        if (file.type?.startsWith("video/")) contentType = "video"
        else if (file.type?.startsWith("audio/")) contentType = "audio"

        const { error: imageError } = await supabase.from("images").insert({
          name: file.name,
          url: file.url,
          category: metadata.category,
          upload_thing_key: file.key,
          file_size: file.size,
          alt_text: file.name,
          user_id: metadata.userId,
          is_active: true,
        })

        if (imageError) {
          console.error("Error saving content image to database:", imageError)
        }

        const { error: contentError } = await supabase.from("content").insert({
          title: file.name,
          content_type: contentType,
          content_url: file.url,
          file_size: file.size,
          required_tier: "frost_fan",
          is_published: false,
        })

        if (contentError) {
          console.error("Error saving content to database:", contentError)
        }
      } catch (error) {
        console.error("Unexpected error saving content:", error)
      }

      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
