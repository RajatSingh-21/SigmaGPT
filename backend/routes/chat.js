import express from "express";
import Thread from "../models/thread.js";
import getGrokAIAPIStream from "../utils/grok.js";
import auth from "../middleware.js"

const router = express.Router();

router.post("/test", auth, async (req, res) => {
  try {
    const thread = new Thread({
      threadId: "shanu",
      title: "testing new thread",
    });
    const response = await thread.save();
    res.send(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "failed to save in database" });
  }
});
//get all threads
router.get("/thread", auth, async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});
//to get specific route
router.get("/thread/:threadId", auth, async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOne({ threadId, userId: req.user.userId });
    if (!thread) {
      res.status(404).json({ error: "thread not found" });
    }
    res.json(thread.messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});
//Delete route
router.delete("/thread/:threadId", auth, async (req, res) => {
  const { threadId } = req.params;
  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId, userId: req.user.userId });

    if (!deletedThread) {
      res.status(404).json({ error: "thread not found" });
    }
    res.status(200).json({ success: "thread deleted succesfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to delete chat" });
  }
});
//new chat route
router.post("/chat", auth, async (req, res) => {

  const { threadId, message } = req.body;

  if (!threadId || !message) {//validate 
    res.status(500).json({ error: "missing fields" });
  }
  try {
    let thread = await Thread.findOne({ threadId, userId: req.user.userId });

    if (!thread) { //if not in db create thread
      thread = new Thread({
        threadId,
        userId: req.user.userId,
        title: message,
        messages: [{ role: "user", content: message }]
      })
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getGrokAIAPIStream(thread.messages.slice(-10));

    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();

    await thread.save();//save the thread
    res.json({ reply: assistantReply });
  }

  catch (err) {
    console.log(err);
    res.status(500).json({ error: "something went wrong" });
  }
})
export default router;
