import { createClient } from '@/utils/supabase/server'

export class AuthService {
  static async getCurrentUser() {
    const supabase = await createClient()
    return await supabase.auth.getUser()
  }

  static async sendPasswordResetEmail(email: string, redirectUrl: string) {
    const supabase = await createClient()
    return await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl })
  }

  static async updateUserPassword(password: string) {
    const supabase = await createClient()
    return await supabase.auth.updateUser({ password })
  }

  static async signOut() {
    const supabase = await createClient()
    return await supabase.auth.signOut()
  }
}
