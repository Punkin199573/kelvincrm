import { type NextRequest, NextResponse } from "next/server"
import { handleFileUpload } from "./core"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = (formData.get("category") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const result = await handleFileUpload(file, category)

    if (result.success) {
      return NextResponse.json({ url: result.url })
    } else {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Upload endpoint ready" })
}
