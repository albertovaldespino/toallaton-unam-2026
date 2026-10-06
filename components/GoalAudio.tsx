"use client";
import {forwardRef,useCallback,useEffect,useImperativeHandle,useRef,useState} from "react";
export type GoalAudioHandle={activateSound:()=>Promise<boolean>};
const GoalAudio=forwardRef<GoalAudioHandle,{reached:boolean;donationActive:boolean}>(function GoalAudio({reached,donationActive},ref){
 const audio=useRef<HTMLAudioElement>(null), completed=useRef(false);
 const [blocked,setBlocked]=useState(false);
 const allowed=useRef(false);allowed.current=reached&&!donationActive;
 const play=useCallback(async()=>{
  if(!audio.current||!allowed.current||completed.current)return false;
  try{await audio.current.play();setBlocked(false);return true;}catch{setBlocked(true);return false;}
 },[]);
 useImperativeHandle(ref,()=>({async activateSound(){
  if(allowed.current)return play();
  const element=audio.current;if(!element||completed.current)return false;
  const attempt=element.play();element.pause();
  try{await attempt;return true;}catch(e){return (e as DOMException).name==='AbortError';}
 }}),[play]);
 useEffect(()=>{
  if(reached&&!donationActive&&!completed.current)void play();
  else {audio.current?.pause();setBlocked(false);}
 },[reached,donationActive,play]);
 useEffect(()=>{const element=audio.current;return()=>element?.pause();},[]);
 return <><audio ref={audio} src="/audio/meta-we-are-the-champions.mp3" preload="auto" onEnded={()=>{completed.current=true;setBlocked(false);}} />
 {blocked&&reached&&!donationActive&&<button className="audio-recovery" style={{position:'fixed',zIndex:1100}} onClick={()=>void play()}>🔊 Reproducir canción de la meta</button>}</>;
});
export default GoalAudio;
