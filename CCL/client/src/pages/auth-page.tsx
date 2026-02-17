import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, login, register } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) setLocation("/");
  }, [user, setLocation]);

  const loginForm = useForm<Pick<InsertUser, "username" | "password">>({
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "", role: "user" },
  });

  const onLogin = async (data: Pick<InsertUser, "username" | "password">) => {
    try {
      await login.mutateAsync(data);
    } catch (e) {
      // handled by mutation error
    }
  };

  const onRegister = async (data: InsertUser) => {
    try {
      await register.mutateAsync(data);
    } catch (e) {
      // handled by mutation error
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
              <Cloud className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">CloudEvents</span>
          </div>
          
          <h1 className="text-5xl font-bold font-display leading-tight mb-6">
            Capture moments,<br />
            Share memories.
          </h1>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed">
            The simplest way to organize events and collect photos from everyone. 
            Secure, fast, and built for the cloud.
          </p>
        </div>

        <div className="relative z-10 grid gap-4">
          <div className="flex items-center gap-3 text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span>Create unlimited events</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span>Secure cloud media storage</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span>Role-based access control</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Enter your details to access your account.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger value="login" className="text-base">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-base">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-0 shadow-none">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input id="login-username" {...loginForm.register("username")} required className="h-11" placeholder="Enter your username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" {...loginForm.register("password")} required className="h-11" placeholder="••••••••" />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base" disabled={login.isPending}>
                    {login.isPending ? "Logging in..." : "Sign In"}
                  </Button>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-0 shadow-none">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Choose a password" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="user">User (View & Upload)</SelectItem>
                              <SelectItem value="admin">Admin (Create Events)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-11 text-base mt-2" disabled={register.isPending}>
                      {register.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
