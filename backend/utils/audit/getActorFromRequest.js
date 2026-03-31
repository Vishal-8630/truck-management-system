import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";

const getActorFromRequest = async (req) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return { id: "system", username: "system", fullname: "System" };
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("username fullname");
    if (!user) {
      return { id: String(payload.id || "system"), username: "unknown", fullname: "Unknown User" };
    }

    return {
      id: String(user._id),
      username: user.username || "unknown",
      fullname: user.fullname || user.username || "Unknown User",
    };
  } catch {
    return { id: "system", username: "system", fullname: "System" };
  }
};

export default getActorFromRequest;
