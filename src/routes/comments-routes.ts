import { Hono } from "hono";

import {
  commentPost,
  getCommentPosts,
  deleteComment,
  updateCommentById,
  getAllComments,
  getCommentsByUser,
} from "../controllers/comments/comment-controller";
import {
  CommentPostError,
  GetCommentPostError,
  DeleteCommentError,
  UpdateCommetError,
} from "../controllers/comments/comment-types";

import { sessionMiddleware } from "./middlewares/session-middleware";

export const commentRoutes = new Hono();


commentRoutes.post("/on/:postId", sessionMiddleware, async (context) => {
  const user = context.get("user");
  const postId = await context.req.param("postId");
  const { content } = await context.req.json();

  if (!user || !user.id) {
    return context.json(
      { message: "Unauthorized: session not found or expired" },
      401
    );
  }

  try {
    const result = await commentPost({
      userId: user.id,
      postId,
      content,
    });

    return context.json(result, 200);
  } catch (e) {
    if (e === CommentPostError.UNAUTHORIZED) {
      return context.json({ message: "User with the token is not found" }, 400);
    }
    if (e === CommentPostError.NOT_FOUND) {
      return context.json({ message: "Post with given id is not found" }, 404);
    }

    console.error("Internal error in commentPost:", e); // 🔍 useful!
    return context.json({ message: "Internal server error" }, 500);
  }
});



commentRoutes.get("/on/:postId", sessionMiddleware, async (context) => {
  const user = context.get("user");
  const page = Number(context.req.query("page") || 1);
  const limit = Number(context.req.query("limit") || 10);
  const postId = await context.req.param("postId");

  try {
    const result = await getCommentPosts({
      userId:user.id,
      postId,
      page,
      limit,
    });

    return context.json(
      {
        data: result.comments,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      },
      200
    );
  } catch (e) {
    if (e === GetCommentPostError.UNAUTHORIZED) {
      return context.json(
        {
          message: "User with the given token is not present",
        },
        400
      );
    }
    if (e === GetCommentPostError.BAD_REQUEST) {
      return context.json(
        {
          error: "There is no comments for this post",
        },
        400
      );
    }

    return context.json(
      {
        message: "Internal Server Error",
      },
      500
    );
  }
});

commentRoutes.delete("/:commentId", sessionMiddleware, async (context) => {
  const userId = context.get("user").id;
  const commentId = String(await context.req.param("commentId"));

  try {
    const result = await deleteComment({
      userId,
      commentId,
    });
    return context.json(result, 200);
  } catch (e) {
    if (e === DeleteCommentError.UNAUTHORIZED) {
      return context.json(
        {
          message: "User with the token does not exists",
        },
        400
      );
    }
    if (e === DeleteCommentError.NOT_FOUND) {
      return context.json(
        {
          message: "Comment with given id not found",
        },
        404
      );
    }
    return context.json(
      {
        message: "Internal Server error",
      },
      500
    );
  }
});

commentRoutes.patch("/:commentId", sessionMiddleware, async (context) => {
  const userId = context.get("user").id;
  const commentId = String(await context.req.param("commentId"));
  const { content } = await context.req.json();

  try {
    const result = await updateCommentById({
      userId,
      commentId,
      content,
    });
    return context.json(result, 200);
  } catch (e) {
    if (e === UpdateCommetError.UNAUTHORIZED) {
      return context.json(
        {
          message: "User with given token is not found",
        },
        400
      );
    }
    if (e === UpdateCommetError.NOT_FOUND) {
      return context.json(
        {
          message: "Comment with given id not found",
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

commentRoutes.get("/all", sessionMiddleware, async (context) => {
  const user = context.get("user");
  const page = Number(context.req.query("page") || 1);
  const limit = Number(context.req.query("limit") || 10);

  try {
    const result = await getAllComments({
      userId: user.id,
      page,
      limit,
    });

    return context.json(
      {
        data: result.comments,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      },
      200
    );
  } catch (e) {
    if (e === GetCommentPostError.UNAUTHORIZED) {
      return context.json({ message: "Unauthorized" }, 401);
    }
    if (e === GetCommentPostError.BAD_REQUEST) {
      return context.json({ message: "No comments found" }, 400);
    }
    return context.json({ message: "Internal Server Error" }, 500);
  }
});


commentRoutes.get("/byUser/:userId", sessionMiddleware, async (context) => {
  const userId = context.req.param("userId");
  const page = Number(context.req.query("page") || 1);
  const limit = Number(context.req.query("limit") || 10);

  try {
    const result = await getCommentsByUser({
      userId,
      page,
      limit,
    });

    return context.json(
      {
        data: result.comments,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      },
      200
    );
  } catch (e) {
    return context.json({ message: "Internal Server Error" }, 500);
  }
});
