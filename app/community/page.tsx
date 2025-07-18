export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Fan Community</h1>

        <div className="text-center mb-12">
          <p className="text-xl text-muted-foreground">
            Connect with fellow Kelvin Creekman fans from around the world
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="text-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Discord Server</h3>
            <p className="text-muted-foreground mb-4">
              Join our active Discord community for real-time chat and exclusive updates.
            </p>
            <p className="text-sm text-muted-foreground">Coming Soon</p>
          </div>

          <div className="text-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Fan Forums</h3>
            <p className="text-muted-foreground mb-4">
              Discuss music, share fan art, and connect with other supporters.
            </p>
            <p className="text-sm text-muted-foreground">Coming Soon</p>
          </div>

          <div className="text-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Local Meetups</h3>
            <p className="text-muted-foreground mb-4">Find and organize local fan meetups in your area.</p>
            <p className="text-sm text-muted-foreground">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
