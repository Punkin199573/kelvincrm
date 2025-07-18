"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Profile } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (
    email: string,
    password: string,
    userData: { full_name: string; membership_tier: string },
  ) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const { toast } = useToast()

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          // Profile doesn't exist yet, this is normal for new users
          console.log("Profile not found, user may be new")
        } else {
          console.error("Error fetching profile:", error)
        }
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error("Unexpected error fetching profile:", error)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error("Error getting session:", error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          setInitialized(true)
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        }

        setLoading(false)
        setInitialized(true)
      } catch (error) {
        console.error("Error in initializeAuth:", error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    if (!initialized) {
      initializeAuth()
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event, session?.user?.email)

      setUser(session?.user ?? null)

      if (session?.user && event !== "SIGNED_OUT") {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      if (initialized) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [initialized, fetchProfile])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        setLoading(false)
        return { error }
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
        // Don't set loading to false here - let the auth state change handle it
        return { error: null }
      }

      setLoading(false)
      return { error: new Error("Unknown error occurred") }
    } catch (error: any) {
      console.error("Sign in error:", error)
      setLoading(false)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: { full_name: string; membership_tier: string }) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: userData.full_name,
            membership_tier: userData.membership_tier,
          },
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        setLoading(false)
        return { error }
      }

      if (data.user) {
        // If email confirmation is required
        if (!data.user.email_confirmed_at) {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to complete your registration.",
          })
          setLoading(false)
          return { error: null }
        }

        // Create profile record if user is immediately confirmed
        try {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            email: email.trim(),
            full_name: userData.full_name,
            tier: userData.membership_tier as any,
            subscription_status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("Error creating profile:", profileError)
            // Don't return error here as the user account was created successfully
          }
        } catch (profileError) {
          console.error("Error creating profile:", profileError)
        }

        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        })

        // Don't set loading to false here - let the auth state change handle it
        return { error: null }
      }

      setLoading(false)
      return { error: new Error("Unknown error occurred") }
    } catch (error: any) {
      console.error("Sign up error:", error)
      setLoading(false)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      setProfile(null)

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error: any) {
      console.error("Sign out error:", error)
      toast({
        title: "Error",
        description: "There was an error signing out.",
        variant: "destructive",
      })
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error: any) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error("No user logged in") }
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (!error) {
        // Refresh profile data
        await fetchProfile(user.id)
      }

      return { error }
    } catch (error: any) {
      console.error("Update profile error:", error)
      return { error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
