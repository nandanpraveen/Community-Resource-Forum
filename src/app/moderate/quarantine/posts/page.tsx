import { db } from "~/server/db";

import * as z from "zod";
import Post from "~/components/Post";

const searchParamsSchema = z.object({
  page: z.coerce.number().pipe(z.int().min(0)).default(0),
});

export default async function QuarantinedPosts({
  searchParams,
}: PageProps<`/moderate/review/posts`>) {
  const params = await searchParamsSchema
    .parseAsync(await searchParams)
    .catch(() => ({
      page: 0,
    }));

  const posts = await db.query.posts.findMany({
    where: {
      quarantined: true,
    },
    with: {
      author: true,
      event: true,
      tags: true,
    },
    offset: params.page * 20,
    limit: 20,
  });

  if (posts.length < 1) {
    return (
      <div className="mx-auto flex h-screen w-full max-w-xl flex-col gap-6 px-6 py-6">
        <p className="max-w-prose text-center text-gray-600">
          There are no quarantined posts.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-screen w-full max-w-xl flex-col gap-6 px-6 py-6">
      {posts.map((post) => (
        <div
          className="overflow-hidden rounded-md border border-gray-300 text-sm"
          key={post.id}
        >
          <Post
            post={post}
            author={post.author}
            event={post.event}
            tags={post.tags}
            vote={null}
            readonly
          />

          {/* <DecisionForm post={post} /> */}
        </div>
      ))}
    </div>
  );
}
