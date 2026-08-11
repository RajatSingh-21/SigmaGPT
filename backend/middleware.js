import thread from "./models/thread.js"
import user from "./models/user.js"
import jwt from 'jsonwebtoken';
import "dotenv/config";

const auth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        // 3. Verify signature and expiration
        const verifiedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // 4. Attach user payload to the request object for downstream routes

        const existingUser = await user.findById(verifiedData.userId);
        if (!existingUser) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        req.user = verifiedData;
        // 5. Pass control to the next handler
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
}
export default auth;