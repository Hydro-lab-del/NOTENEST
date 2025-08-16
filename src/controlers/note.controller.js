import { Note } from "../model/note.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getNotes = async (req, res) => {
    try {
        const notes = await Note.find(
            { userId: req.user._id }
        ).sort(
            {
                pinned: -1, createdAt: -1

            });

        return res
            .status(200)
            .json(
                new ApiResponse(200, notes, "success")
            )
    } catch (error) {
        console.error("Fetch notes error:", error);
        res.status(500).send("Failed to fetch notes");
    }
}
const createNote = asyncHandler(async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        throw new ApiError(400, "All fields are required!");
    }
    const newNote = await Note.create({
        title,
        content,
        userId: req.user._id
    });
    return res
        .status(201)
        .json(new ApiResponse(201, newNote, "Note created successfully"));
});


const updateNote = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const noteId = req.params.id;
    const userId = req.user._id;

    if (!title || !content) {
        throw new ApiError(400, "All fields are required!");
    }

    const updatedNote = await Note.findOneAndUpdate(
        { _id: noteId, userId },
        { title, content },
        { new: true }
    );

    if (!updatedNote) {
        throw new ApiError(404, "Note not found or update failed!");
    }

    return res.status(200).json(new ApiResponse(200, updatedNote, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
    const noteId = req.params.id;
    const userId = req.user._id;

    const deleted = await Note.findOneAndDelete({ _id: noteId, userId });

    if (!deleted) {
        throw new ApiError(404, "Note not found or already deleted!");
    };
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Note deleted successfully"))
});


const togglePin = asyncHandler(async (req, res) => {
    const noteId = req.params.id;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) throw new ApiError(404, "Note not found");

    note.pinned = !note.pinned;
    await note.save();

    return res.status(200).json(new ApiResponse(200, note, `Note ${note.pinned ? "pinned" : "unpinned"} successfully`));
});


export {
    createNote,
    deleteNote,
    getNotes,
    updateNote,
    togglePin
}