import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { User } from "next-auth";
import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
        return Response.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        );
    }

    // if we want to use aggregation pipeline then we have to retrieve user_id like below. otherwise it can face error.
    const userId = new mongoose.Types.ObjectId(_user._id);

    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } },
        ]).exec();

        if (!user || user.length === 0) {
            return Response.json(
              { message: 'User not found', success: false },
              { status: 404 }
            );
        }

        return Response.json(
            { messages: user[0].messages },     // aggregation le array of messages return garxa so, user[0].messages le array of messages return garxa.
            {
              status: 200,
            }
          );
        
    } catch (error) {
        console.log('An unexpected error occurred:', error);
        
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        ); 
    }
    
}