# UploadThing Integration Guide

## Overview
UploadThing is integrated into the Kelvin Creekman Fan Club website for seamless media management. This guide covers the setup, file structure, and usage.

## Environment Variables

Add these to your `.env.local` file:

\`\`\`env
UPLOADTHING_SECRET=sk_live_your_secret_key
UPLOADTHING_APP_ID=your_app_id
\`\`\`

## File Structure

### Core Files
\`\`\`
lib/
  uploadthing.ts          # UploadThing configuration and file router
app/
  api/
    uploadthing/
      core.ts            # Core UploadThing handler
      route.ts           # API route handler
components/
  admin/
    admin-image-management.tsx  # Admin interface with UploadThing
\`\`\`

### File Router Configuration

The file router in \`lib/uploadthing.ts\` defines three endpoints:

1. **imageUploader**: General image uploads (4MB max, 1 file)
2. **productImageUploader**: Product images (4MB max, 5 files)
3. **contentUploader**: Media content (64MB videos, 16MB audio, 8MB images)

### Database Integration

Images uploaded through UploadThing are automatically saved to the \`images\` table with:
- \`upload_thing_key\`: UploadThing file identifier
- \`url\`: Public file URL
- \`file_size\`: File size in bytes
- \`category\`: Image category for organization

## Usage in Admin Panel

### Image Management
1. Navigate to Admin Dashboard → Images tab
2. Click "Add Image" to open the upload dialog
3. Use the UploadThing upload button or enter URL manually
4. Select appropriate category and add alt text
5. Images are automatically organized by category

### Supported Categories
- **Homepage**: Hero sections, banners, featured images
- **Events**: Event banners, gallery images
- **Store**: Product images, store banners
- **Community**: Community page images
- **Content**: Video thumbnails, content images
- **General**: Miscellaneous images

## File Organization in UploadThing

### Recommended Structure
\`\`\`
uploads/
  images/
    homepage/
      hero-banner.jpg
      about-section.jpg
    events/
      concert-2024.jpg
      meetgreet-banner.jpg
    store/
      products/
        tshirt-front.jpg
        tshirt-back.jpg
      banners/
        store-header.jpg
    content/
      thumbnails/
        video-thumb-1.jpg
        audio-thumb-1.jpg
\`\`\`

### File Naming Conventions
- Use descriptive, kebab-case names
- Include dimensions for specific use cases
- Add version numbers for updates
- Examples:
  - \`hero-banner-1920x1080.jpg\`
  - \`product-tshirt-black-front-v2.jpg\`
  - \`event-concert-thumbnail-400x300.jpg\`

## Integration with Website Components

### Dynamic Image Loading
Images can be dynamically loaded in components using the database:

\`\`\`typescript
// Get images by category
const heroImages = await dbHelpers.getImagesByCategory('homepage')

// Use in component
<img src={heroImages[0]?.url || "/placeholder.svg"} alt={heroImages[0]?.alt_text} />
\`\`\`

### Responsive Images
For responsive design, consider uploading multiple sizes:
- Mobile: 768px width
- Tablet: 1024px width  
- Desktop: 1920px width

## Security and Permissions

### File Type Restrictions
- Images: jpg, jpeg, png, gif, webp
- Videos: mp4, webm, mov
- Audio: mp3, wav, ogg

### Size Limits
- Images: 4MB maximum
- Videos: 64MB maximum
- Audio: 16MB maximum

### Access Control
- Only admin users can upload files
- All uploads are public by default
- Files are automatically scanned for malware

## Best Practices

### Image Optimization
1. Compress images before upload
2. Use WebP format when possible
3. Optimize for web (sRGB color space)
4. Include proper alt text for accessibility

### File Management
1. Regularly audit uploaded files
2. Remove unused images to save storage
3. Use consistent naming conventions
4. Organize by category and purpose

### Performance
1. Use appropriate image sizes for context
2. Implement lazy loading for large galleries
3. Consider CDN caching for frequently accessed files
4. Monitor storage usage and costs

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size limits
   - Verify file type is supported
   - Ensure UploadThing keys are correct

2. **Images Not Displaying**
   - Verify URL is accessible
   - Check CORS settings
   - Ensure image exists in UploadThing

3. **Slow Upload Speeds**
   - Compress images before upload
   - Check internet connection
   - Try uploading smaller batches

### Error Handling
The system includes comprehensive error handling:
- Upload failures show user-friendly messages
- Database errors are logged for debugging
- Fallback images prevent broken layouts

## Monitoring and Analytics

### Usage Tracking
- Monitor storage usage in UploadThing dashboard
- Track upload success/failure rates
- Review file access patterns

### Cost Management
- Set up usage alerts
- Regularly clean up unused files
- Optimize file sizes to reduce storage costs

## Migration from Other Services

If migrating from another file storage service:

1. Export existing files and metadata
2. Upload files to UploadThing using the admin interface
3. Update database records with new URLs
4. Test all image references
5. Update any hardcoded URLs in components

This integration provides a robust, scalable solution for media management while maintaining ease of use for administrators.
\`\`\`

The complete backend infrastructure is now implemented with:

1. **Comprehensive Supabase Schema** - All tables, relationships, and security policies
2. **UploadThing Integration** - Seamless media management with proper file organization
3. **Mobile-First Responsive Design** - Super fans component and navigation optimized for mobile
4. **Enhanced Admin Dashboard** - Full control over website images and content
5. **Modern User Dashboard** - Elegant interface for authenticated users
6. **Production-Ready Setup** - Complete with deployment guides and best practices

All components are fully functional, mobile-responsive, and ready for production deployment.
