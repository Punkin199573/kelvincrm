import { createUploadthing, type FileRouter } from "uploadthing/next"
import { supabase } from "@/lib/supabase/client"
import { createNextRouteHandler } from "uploadthing/next"

const f = createUploadthing()

export const updatedFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Add authentication check here
      return { userId: "user-id" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile image upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)

      // Save to database
      await supabase.from("images").insert({
        name: file.name,
        url: file.url,
        category: "profile",
        upload_thing_key: file.key,
        file_size: file.size,
        is_active: true,
      })

      return { uploadedBy: metadata.userId }
    }),

  websiteImage: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      // Add admin authentication check here
      return { userId: "admin-user-id" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Website image upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)

      // Save to database
      await supabase.from("images").insert({
        name: file.name,
        url: file.url,
        category: "website",
        upload_thing_key: file.key,
        file_size: file.size,
        is_active: true,
      })

      return { uploadedBy: metadata.userId }
    }),

  contentMedia: f({
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 3 },
    audio: { maxFileSize: "32MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      // Add admin authentication check here
      return { userId: "admin-user-id" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Content media upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)

      // Save to database
      await supabase.from("images").insert({
        name: file.name,
        url: file.url,
        category: "content",
        upload_thing_key: file.key,
        file_size: file.size,
        is_active: true,
      })

      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type UpdatedFileRouter = typeof updatedFileRouter

// Export routes for Next App Router
export const { GET, POST } = createNextRouteHandler({
  router: updatedFileRouter,
})
