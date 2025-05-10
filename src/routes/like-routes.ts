import { Hono } from "hono";

import {
  likePost,
  getLikePosts,
  deleteLikes,
} from "../controllers/likes/like-controller";
import {
  LikePostError,
  GetLikePostError,
  DeleteLikeError,
} from "../controllers/likes/like-type";
import { sessionMiddleware } from "./middlewares/session-middleware";

export const likeRoutes = new Hono();


likeRoutes.post("/on/:postId", sessionMiddleware, async (context) => {
  const user = context.get("user");
  const postId = await context.req.param("postId");
 
  try {
    const result = await likePost({
      userId:user.id,
      postId,
    });
    return context.json(result, 200);
  } catch (e) {
    if (e === LikePostError.UNAUTHORIZED) {
      return context.json(
        {
          message: "User with the token is not found",
        },
        400
      );
    }
    if (e === LikePostError.NOT_FOUND) {
      return context.json(
        {
          message: "Post with given id is not found",
        },
        404
      );
    }
    if (e === LikePostError.ALREADY_LIKED) {
      return context.json(
        {
          message: "The post is already liked",
        },
        400
      );
    }
    return context.json(
      {
        message: "Internal server error",
      },
      500
    );
  }
});


likeRoutes.get("/on/:postId", sessionMiddleware, async (context) => {
  const user = context.get("user");
  const postId = await context.req.param("postId");

  try {
    const result = await getLikePosts({
      userId: user.id,
      postId,
    });

    return context.json(result, 200);
  } catch (e) {
    if (e === GetLikePostError.UNAUTHORIZED) {
      return context.json({ message: "User unauthorized" }, 400);
    }

    return context.json({ message: "Internal Server Error" }, 500);
  }
});


likeRoutes.delete("/deletelike/:postId", sessionMiddleware, async (context) => {
  const userId = context.get("user").id;
  const postId = String(await context.req.param("postId"));

  try {
    const response = await deleteLikes({
      userId,
      postId,
    });

    return context.json(response, 200);
  } catch (e) {
    if (e === DeleteLikeError.NOT_FOUND) {
      return context.json(
        {
          message: "Post is not found",
        },
        400
      );
    }
    if (e === DeleteLikeError.UNAUTHORIZED) {
      return context.json(
        {
          message: "User is not found",
        },
        400
      );
    }

    if (e === DeleteLikeError.LIKE_NOT_FOUND) {
      return context.json(
        {
          message: "Like on the post is not found",
        },
        400
      );
    }
    return context.json(
      {
        message: "Internal server error",
      },
      500
    );
  }
});
