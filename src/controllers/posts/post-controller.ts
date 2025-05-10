import { prismaClient } from "../../integrations/prisma";
import { GetMeError } from "../users/user-types.js";
import {
  type CreatePostInput,
  type CreatePostResult,
  type GetPostResults,
  CreatePostError,
  GetPostError,
  type GetMePostResult,
  GetMePostError,
  DeletePostError,
  type SearchParams,
} from "./post-types.js";


export const createPost = async (parameters: {
  userId: string;
  input: CreatePostInput;
}): Promise<CreatePostResult> => {
  const { userId, input } = parameters;

  if (!input.title || !input.content) {
    throw CreatePostError.BAD_REQUEST;
  }

  const post = await prismaClient.post.create({
    data: {
      title: input.title,
      content: input.content,
      userId,
    },
  });

  return { post };
};



export const getMePost = async (parameters: {
  userId: string;
  page: number;
  limit: number;
}): Promise<GetMePostResult> => {
  const posts = await prismaClient.post.findMany({
    where: {
      userId: parameters.userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    skip: (parameters.page - 1) * parameters.limit,
    take: parameters.limit,
  });

  if (!posts) {
    throw GetMePostError.BAD_REQUEST;
  }
  const totalPosts = await prismaClient.post.count();

  return {
    posts,
    total: totalPosts,
  };
};

export const deletePost = async (parameters: {
  userId: string;
  postId: string;
}) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id: parameters.userId,
    },
    select:{
      id:true
    }
  });
  console.log(user);

  if (!user) {
    throw DeletePostError.UNAUTHORIZED;
  }
  const post = await prismaClient.post.findUnique({
    where: {
      id: parameters.postId,
    },
  });
  console.log(post);

  if (!post) {
    return DeletePostError.NOT_FOUND;
  }

  if (post.userId !== user.id) {
    throw new Error("Unauthorized");
  }
  try {
    await prismaClient.post.delete({
      where: { id: parameters.postId },
    });
  } catch (err) {
    console.error("Prisma delete error:", err);
    throw new Error("Failed to delete post");
  }
};

export const getPostById = async (postId: string) => {
  const post = await prismaClient.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw GetMeError.BAD_REQUEST;
  }

  return post;
};

export const getPastPosts = async (
  before: string,
  page: number = 1,
  limit: number = 10
): Promise<GetPostResults> => {
  const beforeDate = new Date(before);

  
  const posts = await prismaClient.post.findMany({
    where: {
      createdAt: {
        lt: beforeDate, 
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  
  const totalPosts = await prismaClient.post.count({
    where: {
      createdAt: {
        lt: beforeDate,
      },
    },
  });

  return {
    posts,
    total: totalPosts,
  };
};

export const getAllPosts = async (userId: string, page: number = 1, limit: number = 10) => {
  const posts = await prismaClient.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: {
      select: {
        id: true,
        username: true,
      }
    },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      likes: {
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  const totalPosts = await prismaClient.post.count();

  const formattedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    likes: post._count.likes,
    commentsCount: post._count.comments,
    likedByUser: post.likes.length > 0,
    userId: post.user.id,
    username: post.user.username,
  }));

  return {
    posts: formattedPosts,
    total: totalPosts,
  };
};

export const getPostsByUser = async (parameters: {
  userId: string;
  page: number;
  limit: number;
}) => {
  const posts = await prismaClient.post.findMany({
    where: { userId: parameters.userId },
    orderBy: { createdAt: "desc" },
    skip: (parameters.page - 1) * parameters.limit,
    take: parameters.limit,
  });

  const totalPosts = await prismaClient.post.count({
    where: { userId: parameters.userId },
  });

  return {
    posts,
    total: totalPosts,
  };
};

export const searchPosts = async ({ keyword, page, limit }: SearchParams) => {
  const posts = await prismaClient.post.findMany({
    where: {
      title: {
        contains: keyword,
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prismaClient.post.count({
    where: {
      title: {
        contains: keyword,
        mode: "insensitive",
      },
    },
  });

  return {
    posts,
    total,
  };
};