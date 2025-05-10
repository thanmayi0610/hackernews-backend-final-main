import { prismaClient } from "../../integrations/prisma";
import {
  type LikePostResult,
  LikePostError,
  type GetLikePost,
  GetLikePostError,
  DeleteLikeError,
} from "./like-type";


export const likePost = async (parameters: {
  userId: string;
  postId: string;
}): Promise<LikePostResult> => {
  const { userId, postId } = parameters;

  const existuser = await prismaClient.user.findUnique({
     where: { id: userId },
  select:{
    id:true,
  } });
  if (!existuser) throw LikePostError.UNAUTHORIZED;

  const post = await prismaClient.post.findUnique({ where: { id: postId } });
  if (!post) throw LikePostError.NOT_FOUND;

  const alreadyliked = await prismaClient.like.findFirst({
    where: { userId, postId },
  });
  if (alreadyliked) throw LikePostError.ALREADY_LIKED;

  try {
    const like = await prismaClient.like.create({
      data: {
        userId,
        postId
      },
    });
    return { like };
  } catch (error) {
    console.error("Error creating like:", error); 
   throw LikePostError;
  }
};

export const getLikePosts = async (parameters: {
  userId: string;
  postId: string;
}): Promise<{
  total: number;
  alreadyLiked: boolean;
}> => {
  const user = await prismaClient.user.findUnique({ where: { id: parameters.userId }, select:{
    id:true,
  } });
  if (!user) throw GetLikePostError.UNAUTHORIZED;

  const total = await prismaClient.like.count({ where: { postId: parameters.postId } });

  const alreadyLiked = !!(await prismaClient.like.findFirst({
    where: {
      userId: parameters.userId,
      postId: parameters.postId,
    },
  }));

  return {
    total,
    alreadyLiked,
  };
};


export const deleteLikes = async (parameters: {
  userId: string;
  postId: string;
}) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id: parameters.userId,
    },
    select:{
      id:true,
    }
  });

  if (!user) {
    throw DeleteLikeError.UNAUTHORIZED;
  }
  const post = await prismaClient.post.findUnique({
    where: {
      id: parameters.postId,
    },
  });

  if (!post) {
    return DeleteLikeError.NOT_FOUND;
  }

  const existinglike = await prismaClient.like.findFirst({
    where: {
      userId: parameters.userId,
      postId: parameters.postId,
    },
  });

  if (!existinglike) {
    throw DeleteLikeError.LIKE_NOT_FOUND;
  }

  await prismaClient.like.delete({
    where: {
      id: existinglike.id,
    },
  });
  return {
    message: "Like on the given post deleted suceesfully",
  };
};
