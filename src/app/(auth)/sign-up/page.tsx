"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z  from "zod"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import { sign } from "crypto"
import { set } from "mongoose"
import { ApiResponse } from "@/types/ApiResponse"
import axios, { AxiosError } from 'axios';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react';




const page = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");     // backend maa request gardaa aaune message store garna ko lagi
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);    // loader ko laagi - request backend maa pathaainxa (request pathaaune belaa kaam bhai raaxa tesko laagi loader chaahinxa)
  const [isSumbitting, setIsSubmitting] = useState(false);    // form submit gareko belaa loader ko laagi
  const debouncedUsername = useDebounceCallback(setUsername, 300);

  const { toast } = useToast();
  const router = useRouter();

  // zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });


  useEffect(() => {
    const checkUsernameUnique = async () => {
      setIsCheckingUsername(true);
      setUsernameMessage("");
      try {
        if (username) {
          const response = await axios.get<ApiResponse>(`/api/check-username-unique?username=${username}`);
          let message = response.data.message
          setUsernameMessage(message);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(axiosError.response?.data.message ?? "Error checking username");     // ?? - nullish coalescing operator - if left side is null or undefined then right side is returned
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsernameUnique();

  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    // console.log('data:', data);
    
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);
      toast({
        title: "Success",
        description: "response.data.message",
      });
    router.replace(`/verify/${username}`)
    setIsSubmitting(false);

    } catch (error) {
      console.error('Error during sign-up:', error);
      
      const axiosError = error as AxiosError<ApiResponse>;
      
      // Default error message
      let errorMessage = axiosError.response?.data.message;
      ('There was a problem with your sign-up. Please try again.');

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white I don't know. rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold Join True Feedback lg:text-5xl mb-6 ">
          Join True Feedback
          </h1>
        </div>

        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          name="username"   // zod schema ko username field ko name
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
                <Input
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedUsername(e.target.value);
                }}
                placeholder="Username"
              />
              {isCheckingUsername && <Loader2 className="animate-spin" />}
              {!isCheckingUsername && usernameMessage && (
                <p
                  className={`text-sm ${
                    usernameMessage === 'Username is unique'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {usernameMessage}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="email"  // zod schema ko email field ko name
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input {...field} name="email" placeholder="Email" />
              <p className='text-muted text-gray-400 text-sm'>We will send you a verification code</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField   // zod schema ko password field ko name
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <Input type="password" {...field} name="password" placeholder="Password" />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSumbitting}
        >
          {isSumbitting ? <Loader2 className="animate-spin" /> : "Sign Up"}
        </Button>

        </form>
        </Form>

        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default page