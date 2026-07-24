import { put } from "@vercel/blob";
import { createRestaurant,listRestaurants,toggleRestaurantVote } from "@/lib/database";

export async function GET(){
  try{return Response.json({restaurants:await listRestaurants()})}
  catch(error){console.error(error);return Response.json({error:"맛집 목록을 불러오지 못했어요."},{status:500})}
}
export async function POST(request:Request){
  try{
    const form=await request.formData(),photo=form.get("photo");
    const fields={name:String(form.get("name")??"").trim(),category:String(form.get("category")??"").trim(),location:String(form.get("location")??"").trim(),menu:String(form.get("menu")??"").trim(),price:String(form.get("price")??"").trim(),note:String(form.get("note")??"").trim(),owner:String(form.get("owner")??"").trim()};
    if(!(photo instanceof File)||!photo.type.startsWith("image/"))return Response.json({error:"맛집 사진을 골라주세요."},{status:400});
    if(photo.size>10*1024*1024)return Response.json({error:"사진은 10MB 이하만 가능해요."},{status:400});
    if(Object.values(fields).some(value=>!value))return Response.json({error:"모든 항목을 채워주세요."},{status:400});
    const blob=await put(`restaurants/${Date.now()}-${photo.name.replace(/[^a-zA-Z0-9._-]/g,"-")}`,photo,{access:"public",addRandomSuffix:true});
    return Response.json({restaurants:await createRestaurant({...fields,photo:blob.url})},{status:201});
  }catch(error){console.error(error);return Response.json({error:"맛집을 저장하지 못했어요."},{status:500})}
}
export async function PATCH(request:Request){
  try{
    const {restaurantId,profileName}=await request.json();
    return Response.json({restaurants:await toggleRestaurantVote(String(restaurantId),String(profileName))});
  }catch(error){console.error(error);return Response.json({error:"투표를 저장하지 못했어요."},{status:500})}
}
