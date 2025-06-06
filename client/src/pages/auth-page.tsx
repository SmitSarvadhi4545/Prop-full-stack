// import { useState } from "react";
// import { useAuth } from "@/hooks/use-auth";
// import { Redirect } from "wouter";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { insertUserSchema, loginUserSchema } from "@shared/schema";
// import { z } from "zod";
// import { Loader2, Music } from "lucide-react";

// const loginSchema = loginUserSchema;
// const registerSchema = insertUserSchema;

// type LoginFormData = z.infer<typeof loginSchema>;
// type RegisterFormData = z.infer<typeof registerSchema>;

// export default function AuthPage() {
//   const { user, loginMutation, registerMutation } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);

//   // Redirect if user is already logged in
//   if (user) {
//     return <Redirect to="/" />;
//   }

//   const loginForm = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const registerForm = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       username: "",
//       email: "",
//       password: "",
//       name: "",
//     },
//   });

//   const handleLogin = async (data: LoginFormData) => {
//     setIsLoading(true);
//     try {
//       await loginMutation.mutateAsync(data);
//     } catch (error) {
//       // Error is handled by the mutation's onError callback
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRegister = async (data: RegisterFormData) => {
//     setIsLoading(true);
//     try {
//       await registerMutation.mutateAsync(data);
//     } catch (error) {
//       // Error is handled by the mutation's onError callback
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex">
//       {/* Left side - Auth Forms */}
//       <div className="flex-1 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">
//           {/* Logo */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
//               <Music className="h-8 w-8 text-primary-foreground" />
//             </div>
//             <h1 className="text-3xl font-bold text-white mb-2">PlaylistHub</h1>
//             <p className="text-muted-foreground">Manage your music, your way</p>
//           </div>

//           <Card className="bg-gray-800 border-gray-700">
//             <CardHeader className="text-center">
//               <CardTitle className="text-white">Welcome</CardTitle>
//               <CardDescription className="text-muted-foreground">
//                 Sign in to your account or create a new one
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Tabs defaultValue="login" className="w-full">
//                 <TabsList className="grid w-full grid-cols-2 bg-gray-700">
//                   <TabsTrigger value="login" className="text-white data-[state=active]:bg-primary">
//                     Sign In
//                   </TabsTrigger>
//                   <TabsTrigger value="register" className="text-white data-[state=active]:bg-primary">
//                     Sign Up
//                   </TabsTrigger>
//                 </TabsList>

//                 {/* Login Form */}
//                 <TabsContent value="login" className="space-y-4">
//                   <Form {...loginForm}>
//                     <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
//                       <FormField
//                         control={loginForm.control}
//                         name="email"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-white">Email</FormLabel>
//                             <FormControl>
//                               <Input
//                                 type="email"
//                                 placeholder="Enter your email"
//                                 className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={loginForm.control}
//                         name="password"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-white">Password</FormLabel>
//                             <FormControl>
//                               <Input
//                                 type="password"
//                                 placeholder="Enter your password"
//                                 className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <Button
//                         type="submit"
//                         className="w-full bg-primary hover:bg-primary/90"
//                         disabled={isLoading || loginMutation.isPending}
//                       >
//                         {isLoading || loginMutation.isPending ? (
//                           <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             Signing In...
//                           </>
//                         ) : (
//                           "Sign In"
//                         )}
//                       </Button>
//                     </form>
//                   </Form>
//                 </TabsContent>

//                 {/* Register Form */}
//                 <TabsContent value="register" className="space-y-4">
//                   <Form {...registerForm}>
//                     <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
//                       <FormField
//                         control={registerForm.control}
//                         name="name"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-white">Full Name</FormLabel>
//                             <FormControl>
//                               <Input
//                                 placeholder="Enter your full name"
//                                 className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={registerForm.control}
//                         name="username"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-white">Username</FormLabel>
//                             <FormControl>
//                               <Input
//                                 placeholder="Choose a username"
//                                 className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={registerForm.control}
//                         name="email"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-white">Email</FormLabel>
//                             <FormControl>
//                               <Input
//                                 type="email"
//                                 placeholder="Enter your email"
//                                 className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={registerForm.control}
//                         name="password"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-white">Password</FormLabel>
//                             <FormControl>
//                               <Input
//                                 type="password"
//                                 placeholder="Create a password"
//                                 className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <Button
//                         type="submit"
//                         className="w-full bg-primary hover:bg-primary/90"
//                         disabled={isLoading || registerMutation.isPending}
//                       >
//                         {isLoading || registerMutation.isPending ? (
//                           <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             Creating Account...
//                           </>
//                         ) : (
//                           "Create Account"
//                         )}
//                       </Button>
//                     </form>
//                   </Form>
//                 </TabsContent>
//               </Tabs>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Right side - Hero Section */}
//       <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-primary/20 to-primary/5">
//         <div className="text-center max-w-md">
//           <div className="mb-8">
//             <Music className="h-24 w-24 text-primary mx-auto mb-6" />
//           </div>
//           <h2 className="text-4xl font-bold text-white mb-4">
//             Your Music, Your Way
//           </h2>
//           <p className="text-xl text-muted-foreground mb-8">
//             Create and manage your playlists with songs from Spotify.
//             Discover new music and organize your favorites.
//           </p>
//           <div className="space-y-4 text-left">
//             <div className="flex items-center text-muted-foreground">
//               <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
//               Search millions of songs from Spotify
//             </div>
//             <div className="flex items-center text-muted-foreground">
//               <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
//               Create unlimited playlists
//             </div>
//             <div className="flex items-center text-muted-foreground">
//               <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
//               Organize your music collection
//             </div>
//             <div className="flex items-center text-muted-foreground">
//               <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
//               Access from any device
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, Music } from "lucide-react";

const loginSchema = loginUserSchema;
const registerSchema = insertUserSchema;

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      name: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerMutation.mutateAsync(data);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex">
      {/* Left side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Music className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">PlaylistHub</h1>
            <p className="text-muted-foreground">Manage your music, your way</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Welcome</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                  <TabsTrigger
                    value="login"
                    className="text-white data-[state=active]:bg-primary"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="text-white data-[state=active]:bg-primary"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login" className="space-y-4">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(handleLogin)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={isLoading || loginMutation.isPending}
                      >
                        {isLoading || loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register" className="space-y-4">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(handleRegister)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Choose a username"
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                                {...field}
                              />
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
                            <FormLabel className="text-white">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a password"
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={isLoading || registerMutation.isPending}
                      >
                        {isLoading || registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <Music className="h-24 w-24 text-primary mx-auto mb-6" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Your Music, Your Way
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create and manage your playlists with songs from Spotify. Discover
            new music and organize your favorites.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              Search millions of songs from Spotify
            </div>
            <div className="flex items-center text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              Create unlimited playlists
            </div>
            <div className="flex items-center text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              Organize your music collection
            </div>
            <div className="flex items-center text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              Access from any device
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
