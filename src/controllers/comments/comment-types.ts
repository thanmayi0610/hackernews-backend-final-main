import type { Comment } from "../../generated/prisma/client";

export enum CommentPostError {
	NOT_FOUND,
	UNAUTHORIZED,
}

export type CommentPostResult = {
	comment: Comment;
};

export type GetCommentPost = {
	comments: Array<Comment>;
	total: number;
};
export enum GetCommentPostError {
	BAD_REQUEST,
	UNAUTHORIZED,
}

export enum DeleteCommentError {
	NOT_FOUND,
	UNAUTHORIZED,
}

export type UpdateCommet = {
	comment: Comment;
};

export enum UpdateCommetError {
	NOT_FOUND,
	UNAUTHORIZED,
}
