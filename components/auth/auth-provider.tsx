"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface Profile {
  id: string
  email: string
  full_name?: string
  tier?: "frost_fan" | "blizzard_vip" | "avalanche_backstage"
  subscription_status?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  is_admin?: boolean
  created_at?: string
  updated_at?: string
}

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

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Profile fetch timeout")), 10000)
      })

      const fetchPromise = supabase.from("profiles").select("*").eq("id", userId).single()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      if (error) {
        if (error.code === "PGRST116") {
          // Profile doesn't exist yet, this is normal for new users
          console.log("Profile not found for user:", userId)
          return null
        } else if (error.message?.includes("infinite recursion")) {
          console.error("RLS policy recursion detected, skipping profile fetch")
          return null
        } else {
          console.error("Error fetching profile:", error)
          return null
        }
      }

      return data
    } catch (error: any) {
      if (error.message === "Profile fetch timeout") {
        console.error("Profile fetch timed out")
      } else {
        console.error("Unexpected error fetching profile:", error)
      }
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let profileFetchInProgress = false

    const initializeAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (error) {
          console.error("Session error:", error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          setInitialized(true)
          return
        }

        setUser(session?.user ?? null)

        // Only fetch profile if we have a user and no fetch is in progress
        if (session?.user && !profileFetchInProgress) {
          profileFetchInProgress = true
          try {
            const profileData = await fetchProfile(session.user.id)
            if (isMounted) {
              setProfile(profileData)
            }
          } finally {
            profileFetchInProgress = false
          }
        }

        if (isMounted) {
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (isMounted) {
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
      if (!isMounted) return

      console.log("Auth state change:", event, session?.user?.email)

      setUser(session?.user ?? null)

      if (session?.user && event !== "SIGNED_OUT" && !profileFetchInProgress) {
        profileFetchInProgress = true
        try {
          const profileData = await fetchProfile(session.user.id)
          if (isMounted) {
            setProfile(profileData)
          }
        } finally {
          profileFetchInProgress = false
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null)
      }

      if (initialized && isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
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
        setLoading(false)
        return { error }
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
        // Loading will be set to false by the auth state change listener
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
        setLoading(false)
        return { error }
      }

      if (data.user) {
        if (!data.user.email_confirmed_at) {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to complete your registration.",
          })
          setLoading(false)
          return { error: null }
        } else {
          // Create profile if user is immediately confirmed
          try {
            await supabase.from("profiles").insert({
              id: data.user.id,
              email: email.trim(),
              full_name: userData.full_name,
              tier: userData.membership_tier as any,
              subscription_status: "pending",
              is_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          } catch (profileError) {
            console.error("Error creating profile:", profileError)
            // Don't fail the signup if profile creation fails
          }

          toast({
            title: "Account created!",
            description: "Your account has been created successfully.",
          })
          // Loading will be set to false by the auth state change listener
          return { error: null }
        }
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
        const updatedProfile = await fetchProfile(user.id)
        setProfile(updatedProfile)
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
