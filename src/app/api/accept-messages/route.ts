import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: 'User not authenticated'
        }, {
            status: 401
        })
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        // Update the user's message acceptance status
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },        // Update the user's message acceptance status
            { new: true }                                   // Return the updated document
        )

        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                message: 'Unable to find user to update message acceptance status'
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            success: false,
            message: 'Message acceptance status updated successfully',
            updatedUser                     // Return the updated user
        }, {
            status: 200
        })

        
    } catch (error) {
        console.log('Error updating message acceptance status:', error);
        return NextResponse.json({
            success: false,
            message: 'Error updating message acceptance status:', error
        }, {
            status: 500
        
        })
    }
}

export async function GET(request: NextRequest) {
    await dbConnect();

     // Get the user session
    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    // Check if the user is authenticated
    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: 'User not authenticated'
        }, {
            status: 401
        })
    }

    try {
        // Retrieve the user from the database using the ID
        const foundUser = await UserModel.findById(user._id);

        if (!foundUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            success: true,
            message: 'User message acceptance status retrieved successfully',
            isAcceptingMessages: foundUser.isAcceptingMessages                      // Return the user's message acceptance status
        }, {
            status: 200
        })

    } catch (error) {
        console.log('Error retrieving message acceptance status:', error);
        return NextResponse.json({
            success: false,
            message: 'Error retrieving message acceptance status:'
        }, {
            status: 500
        });
    }


}