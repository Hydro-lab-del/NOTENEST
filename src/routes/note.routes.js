import { Router } from "express";
import { createNote, deleteNote , getNotes, updateNote, togglePin} from '../controlers/note.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/').get(verifyJWT, getNotes)
router.route('/create').post(verifyJWT, createNote);
router.route('/:id').put(verifyJWT, updateNote);
router.route('/:id').delete(verifyJWT, deleteNote);
router.route('/:id/pin').put(verifyJWT, togglePin);
export default router;