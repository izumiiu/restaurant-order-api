import mongoose from "mongoose";
const Schema = mongoose.Schema;

interface User {
    username: string,
    role: 'customer' | 'employee',
    password: string,
    refreshToken?: string,
}

const userSchema = new Schema<User> ({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['customer', 'employee'],
        default: 'customer',
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    refreshToken: { type: String, select: false }
})

export default mongoose.model<User>('User', userSchema);