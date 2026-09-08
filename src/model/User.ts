import mongoose from "mongoose";
const Schema = mongoose.Schema;

interface User {
    username: string,
    roles?: {
        User?: number,
        Admin?: number
    },
    password: string,
    refreshToken: string,
}

const userSchema = new Schema<User> ({
    username: {
        type: String,
        required: true
    },
    roles: {
        User: {
            type: Number,
            default: 2001
        },
        Admin: Number
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: String
})

export default mongoose.model<User>('User', userSchema);