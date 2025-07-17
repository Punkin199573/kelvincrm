import { createUploadthing, type FileRouter } from "uploadthing/next";
import { supabase } from "@/lib/supabase/client";

const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      return { userId: "user-id" }; // Replace with real auth if needed
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { error } = await supabase.from("images").insert({
        name: file.name,
        url: file.url,
        category: "profile",
        upload_thing_key: file.key,
        file_size: file.size,
        is_active: true,
      });

      if (error) console.error("Supabase insert error (profileImage):", error);
      return { uploadedBy: metadata.userId };
    }),

  websiteImage: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } })
    .middleware(async () => {
      return { userId: "admin-user-id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { error } = await supabase.from("images").insert({
        name: file.name,
        url: file.url,
        category: "website",
        upload_thing_key: file.key,
        file_size: file.size,
        is_active: true,
      });

      if (error) console.error("Supabase insert error (websiteImage):", error);
      return { uploadedBy: metadata.userId };
    }),

  contentMedia: f({
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 3 },
    audio: { maxFileSize: "32MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      return { userId: "admin-user-id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { error } = await supabase.from("images").insert({
        name: file.name,
        url: file.url,
        category: "content",
        upload_thing_key: file.key,
        file_size: file.size,
        is_active: true,
      });

      if (error) console.error("Supabase insert error (contentMedia):", error);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
