export default function EventSuccessLoading() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Processing your booking...</h1>
          <p className="text-muted-foreground mt-2">Please wait while we confirm your event ticket.</p>
        </div>
      </div>
    </div>
  )
}
