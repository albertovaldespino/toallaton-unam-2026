"use client";
import {forwardRef,useCallback,useEffect,useImperativeHandle,useRef,useState} from "react";
import { PUBLIC_DONATION_GOAL } from "@/lib/goal";
export type GoalAudioHandle={activateSound:()=>Promise<boolean>};
const STORAGE_KEY = `toallaton-goal-${PUBLIC_DONATION_GOAL}-audio`;
const GoalAudio=forwardRef<GoalAudioHandle,{reached:boolean;donationActive?:boolean}>(function GoalAudio({reached},ref){
 const audio=useRef<HTMLAudioElement>(null), completed=useRef(false);
 const position=useRef(0), started=useRef(false);
 const [blocked,setBlocked]=useState(false);
 const allowed=useRef(false);allowed.current=reached;
 const remember=useCallback(()=>{
  if(!started.current&&!completed.current)return;
  position.current=audio.current?.currentTime??position.current;
  try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify({completed:completed.current,position:position.current}));}catch{}
 },[]);
 useEffect(()=>{
  try{
   const saved=JSON.parse(sessionStorage.getItem(STORAGE_KEY)||"null");
   completed.current=saved?.completed===true;
   if(Number.isFinite(saved?.position)&&saved.position>=0)position.current=saved.position;
  }catch{}
 },[]);
 const restorePosition=useCallback(()=>{
  const element=audio.current;
  if(element&&position.current>0&&!completed.current){
   element.currentTime=Number.isFinite(element.duration)?Math.min(position.current,element.duration):position.current;
  }
 },[]);
 const play=useCallback(async()=>{
  if(!audio.current||!allowed.current||completed.current)return false;
  try{audio.current.volume=1;audio.current.muted=false;await audio.current.play();started.current=true;setBlocked(false);return true;}catch{setBlocked(true);return false;}
 },[]);
 useImperativeHandle(ref,()=>({async activateSound(){
  if(allowed.current)return play();
  const element=audio.current;if(!element||completed.current)return false;
  element.volume=0; element.muted=false;
  try{
   await element.play();
   if(!allowed.current){element.pause();}else{started.current=true;}
   element.volume=1;
   return true;
  }catch{element.volume=1;return false;}
 }}),[play]);
 useEffect(()=>{
  if(reached&&!completed.current)void play();
  else {audio.current?.pause();setBlocked(false);}
 },[reached,play]);
 useEffect(()=>{const element=audio.current;return()=>{remember();element?.pause();};},[remember]);
 return <><audio ref={audio} src="/audio/meta-we-will-rock-you.mp3" preload="auto" onLoadedMetadata={restorePosition} onTimeUpdate={remember} onPause={remember} onEnded={()=>{completed.current=true;remember();setBlocked(false);}} />
 {blocked&&reached&&<button className="audio-recovery" style={{position:'fixed',zIndex:1100}} onClick={()=>void play()}>🔊 Reproducir canción de la meta</button>}</>;
});
export default GoalAudio;
