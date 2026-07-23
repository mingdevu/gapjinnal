import { put } from "@vercel/blob";
import { listProfiles, saveProfilePhoto } from "@/lib/database";
export async function GET(){return Response.json({profiles:await listProfiles()})}
export async function POST(request:Request){
  try{
    const form=await request.formData(),name=String(form.get("name")??""),photo=form.get("photo");
    if(!(photo instanceof File)||!photo.type.startsWith("image/"))return Response.json({error:"사진을 선택해주세요."},{status:400});
    if(photo.size>5*1024*1024)return Response.json({error:"프로필 사진은 5MB 이하만 가능해요."},{status:400});
    const blob=await put(`profiles/${name}-${Date.now()}`,photo,{access:"public",addRandomSuffix:true});
    return Response.json({profile:await saveProfilePhoto(name,blob.url)});
  }catch(error){console.error(error);return Response.json({error:"프로필 사진을 저장하지 못했어요."},{status:500})}
}
