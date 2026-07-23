import { rateMemory } from "@/lib/database";
export async function POST(request:Request) {
  try {
    const {memoryId,profileName,value}=await request.json(),amount=Number(value);
    if(!memoryId||!profileName||!Number.isFinite(amount)||amount<0||amount>999999999)return Response.json({error:"금액을 확인해주세요."},{status:400});
    await rateMemory(String(memoryId),String(profileName),Math.round(amount));
    return Response.json({ok:true});
  } catch(error){console.error(error);return Response.json({error:"값을 저장하지 못했어요."},{status:500})}
}
