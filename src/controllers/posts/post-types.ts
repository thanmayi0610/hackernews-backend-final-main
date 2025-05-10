import type { Post } from "../../generated/prisma/client";

export type CreatePostInput = {
	title: string;
	content: string;
};
export type CreatePostResult = {
	post: Post;
};

export enum CreatePostError {
	BAD_REQUEST,
	UNAUTHORIZED,
}

export type GetPostResults = {
	posts: Array<Post>;
	total: number;
};
export enum GetPostError {
	BAD_REQUEST,
}

export type GetMePostResult = {
	posts: Array<Post>;
	total: number;
};

export enum GetMePostError {
	BAD_REQUEST,
}

export enum DeletePostError {
	NOT_FOUND,
	UNAUTHORIZED,
}

export type SearchParams = {
	keyword: string;
	page: number;
	limit: number;
};
