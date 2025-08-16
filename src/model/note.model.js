import mongoose from "mongoose";


const noteSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        pinned: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true })


export const Note = mongoose.model("Note", noteSchema);