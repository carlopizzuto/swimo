"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", confirmPassword: "" })
  const { login, register } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(loginForm)
      router.push("/")
    } catch (error) {
      setError("Invalid username or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      await register({ username: registerForm.username, password: registerForm.password })
      router.push("/")
    } catch (error) {
      setError("Username already exists or registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SWIMO</h1>
          <p className="text-gray-400">Sign in to discover your next favorite movie</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger value="login" className="text-gray-400 data-[state=active]:text-white">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="text-gray-400 data-[state=active]:text-white">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Login</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  {error && (
                    <Alert className="bg-red-900/20 border-red-900/50 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Register</CardTitle>
                <CardDescription className="text-gray-400">
                  Create a new account to start discovering movies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  {error && (
                    <Alert className="bg-red-900/20 border-red-900/50 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
