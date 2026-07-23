import { put } from "@vercel/blob";
import { createMemory, listMemories } from "@/lib/database";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json({ memories: await listMemories() });
  } catch (error) {
    console.error(error);
    return Response.json({ error:"추억을 불러오지 못했습니다." }, { status:500 });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const photo = form.get("photo");
    const title = String(form.get("title") ?? "").trim();
    const place = String(form.get("place") ?? "").trim();
    const owner = String(form.get("owner") ?? "친구").trim() || "친구";
    const value = Number(form.get("value"));
    if (!(photo instanceof File) || !photo.type.startsWith("image/")) return Response.json({error:"이미지 파일을 선택해주세요."},{status:400});
    if (photo.size > 10*1024*1024) return Response.json({error:"사진은 10MB 이하만 올릴 수 있습니다."},{status:400});
    if (!title || !place || !Number.isFinite(value) || value < 0) return Response.json({error:"제목, 장소, 금액을 올바르게 입력해주세요."},{status:400});
    const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const blob = await put(`memories/${Date.now()}-${safeName}`, photo, {access:"public",addRandomSuffix:true});
    const memory = await createMemory({title,place,owner,value:Math.round(value),image:blob.url});
    return Response.json({memory},{status:201});
  } catch (error) {
    console.error(error);
    return Response.json({error:"저장 중 문제가 생겼습니다. 잠시 후 다시 시도해주세요."},{status:500});
  }
}
