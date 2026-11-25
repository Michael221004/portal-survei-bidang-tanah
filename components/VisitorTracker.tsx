"use client";
import { useEffect } from "react";
import { supabase, isConfigured } from "@/lib/supabase";
export default function VisitorTracker(){
  useEffect(()=>{
    if(!isConfigured) return;
    const key="survey-visit-"+new Date().toISOString().slice(0,10);
    if(sessionStorage.getItem(key)) return;
    supabase.rpc("record_page_view").then(({error})=>{
      if(!error) sessionStorage.setItem(key,"1");
    });
  },[]);
  return null;
}