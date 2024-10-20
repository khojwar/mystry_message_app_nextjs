'use client'

import { useToast } from "@/hooks/use-toast"
import { Message } from '@/model/User'
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { set } from "mongoose";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, RefreshCcw } from "lucide-react";
import { MessageCard } from "@/components/MessageCard";


function page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isloading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);

  const { toast } = useToast()

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  }

  const {data: session} = useSession();

  // 1. Define form.
  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);


  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    try {
      setIsLoading(true);
      setIsSwitchLoading(false);

      const response = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(response.data.messages || []);

      if (refresh) {
        toast({
           title: 'Refreshed messages',
           description: 'Showing latest messages',
        })
      }
      
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch messages',
        variant: 'destructive',
      });
      
    } finally {
      setIsLoading(false);
      setIsSwitchLoading(false);
    }
  }, [setIsLoading, setMessages, toast]);


  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();
    fetchAcceptMessages();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

  // Handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {acceptMessages: !acceptMessages,});    
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response.data.message,
        variant: 'default',
      });  
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to update message settings',
        variant: 'destructive',
      });
      
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }

  const { username } = session.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;     // Get base URL of the current page for sharing message link to social media platforms like Twitter, Facebook, etc. 
  const profileUrl = `${baseUrl}/u/${username}`;                            // Construct profile URL for the user. 

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };






  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}

        <div className="flex items-center">
          <input type="text" value={profileUrl} disabled className="input input-bordered w-full p-2 mr-2" />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>

      <Separator />

      <Button 
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
        variant="outline"
        className="mt-4"
      >
        {
          isloading ? (<Loader2 className="h-4 w-4 animate-spin" />

          ) : (
            <RefreshCcw className="h-4 w-4" />
          )
        }
      </Button>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {
          messages.length > 0 ? (
            messages.map((message, index) => (
              <MessageCard
              key={message._id as string | number}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
            ))
          ) : (
            <p>No messages to display.</p>
          )
        }
      </div>

    </div>
  )
}

export default page