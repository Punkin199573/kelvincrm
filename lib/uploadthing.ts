import { createUploadthing, type FileRouter } from "uploadthing/next";
import { supabase } from "@/lib/supabase/client";

const f = createUploadthing();

export const ourFileRouter = {
  // General Image Uploader
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      return { userId: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      const { error } = await supabase.from("images").insert({
        name: file.name,
        url: file.url,
        category: "general",
        upload_thing_key: file.key,
        file_size: file.size,
        alt_text: file.name,
      });

      if (error) console.error("Supabase images insert error:", error);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Product Image Uploader
  productImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async () => {
      return { userId: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Product image upload complete:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Content Uploader (Image, Video, Audio)
  contentUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "64MB", maxFileCount: 1 },
    audio: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      return { userId: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Content upload complete:", file.url);

      let contentType: "video" | "audio" | "image" = "image";
      if (file.type?.startsWith("video/")) contentType = "video";
      else if (file.type?.startsWith("audio/")) contentType = "audio";

      const { error } = await supabase.from("content").insert({
        title: file.name,
        content_type: contentType,
        content_url: file.url,
        file_size: file.size,
        required_tier: "frost_fan",
        is_published: false,
      });

      if (error) console.error("Supabase content insert error:", error);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
