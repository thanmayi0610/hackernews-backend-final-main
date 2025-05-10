import { Hono } from "hono";
import { getAllUsers, getMe, getUserById } from "../controllers/users/user-controller";
import { GetMeError } from "../controllers/users/user-types";
import { sessionMiddleware } from "./middlewares/session-middleware";

export const usersRoutes = new Hono();

usersRoutes.get("/me", sessionMiddleware, async (context) => {
  const userId = context.get("user").id;

  try {
    const user = await getMe({
      userId,
    });

    return context.json(
      {
        data: user,
      },
      200
    );
  } catch (e) {
    if (e === GetMeError.BAD_REQUEST) {
      return context.json(
        {
          error: "User not found",
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

usersRoutes.get("/getAllusers", sessionMiddleware, async (context) => {
  const page = Number(context.req.query("page") || 1);
  const limit = Number(context.req.query("limit") || 10);
  try {
    const result = await getAllUsers(page, limit);

    return context.json(
      {
        data: result.users,
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
    return context.json({ message: e }, 404);
  }
});

usersRoutes.get("/:userId", sessionMiddleware, async (context) => {
  const userId = context.req.param("userId");

  try {
    const user = await getUserById(userId);

    return context.json({ data: user }, 200);
  } catch (error) {
    if (error === "USER_NOT_FOUND") {
      return context.json({ error: "User not found" }, 404);
    }
    return context.json({ message: "Internal Server Error" }, 500);
  }
});
