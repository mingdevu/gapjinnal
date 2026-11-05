import { createComment, listComments } from "@/lib/database";

const MAX_COMMENT_LENGTH = 240;

export async function GET(request: Request) {
  const memoryId = new URL(request.url).searchParams.get("memoryId");
  if (!memoryId) return Response.json({ error: "추억 ID가 필요해요." }, { status: 400 });
  try {
    return Response.json({ comments: await listComments(memoryId) });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "댓글을 불러오지 못했어요." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { memoryId, profileName, body } = await request.json();
    const text = String(body ?? "").trim();
    if (!memoryId || !profileName || !text) return Response.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });
    if (text.length > MAX_COMMENT_LENGTH) return Response.json({ error: `댓글은 ${MAX_COMMENT_LENGTH}자까지 쓸 수 있어요.` }, { status: 400 });
    return Response.json({ comments: await createComment(String(memoryId), String(profileName), text) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "댓글을 저장하지 못했어요." }, { status: 500 });
  }
}
