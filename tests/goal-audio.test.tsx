import React from 'react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import GoalAudio from '@/components/GoalAudio';
const key='toallaton-goal-22500-audio';
beforeEach(()=>{
 sessionStorage.clear();
 vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
 vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('uses the complete replacement song and resumes without resetting on donation updates',async()=>{
 const {container,rerender}=render(<GoalAudio reached={false} donationActive={false}/>);
 const audio=container.querySelector('audio')!;
 expect(audio.getAttribute('src')).toBe('/audio/meta-we-will-rock-you.mp3');
 expect(audio.loop).toBe(false);
 expect(audio.play).not.toHaveBeenCalled();
 rerender(<GoalAudio reached donationActive/>);await act(async()=>{});
 expect(audio.volume).toBe(1);expect(audio.muted).toBe(false);
 audio.currentTime=40;fireEvent.timeUpdate(audio);
 rerender(<GoalAudio reached donationActive/>);
 rerender(<GoalAudio reached donationActive={false}/>);await act(async()=>{});
 expect(audio.currentTime).toBe(40);
 expect(audio.play).toHaveBeenCalledTimes(1);
 rerender(<GoalAudio reached donationActive={false}/>);
 expect(audio.play).toHaveBeenCalledTimes(1);
 fireEvent.ended(audio);
 rerender(<GoalAudio reached donationActive/>);
 rerender(<GoalAudio reached donationActive={false}/>);
 expect(audio.play).toHaveBeenCalledTimes(1);
 expect(JSON.parse(sessionStorage.getItem(key)!).completed).toBe(true);
});
it('does not replay a completed goal after remounting or changing screen orientation',async()=>{
 const first=render(<GoalAudio reached donationActive={false}/>);await act(async()=>{});
 fireEvent.ended(first.container.querySelector('audio')!);first.unmount();
 vi.mocked(HTMLMediaElement.prototype.play).mockClear();
 render(<GoalAudio reached donationActive={false}/>);await act(async()=>{});
 expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
});
it('restores the saved position after a screen reload',async()=>{
 const first=render(<GoalAudio reached donationActive={false}/>);await act(async()=>{});
 const previous=first.container.querySelector('audio')!;
 previous.currentTime=57;fireEvent.timeUpdate(previous);first.unmount();
 const next=render(<GoalAudio reached donationActive={false}/>);await act(async()=>{});
 const audio=next.container.querySelector('audio')!;
 fireEvent.loadedMetadata(audio);
 expect(audio.currentTime).toBe(57);
});
it('preserves the existing recovery button when autoplay is denied',async()=>{
 vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new DOMException('Blocked','NotAllowedError'));
 const {container}=render(<GoalAudio reached donationActive={false}/>);await act(async()=>{});
 const audio=container.querySelector('audio')!;
 expect(JSON.parse(sessionStorage.getItem(key)||'null')).toBeNull();
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'🔊 Reproducir canción de la meta'})));
 expect(audio.play).toHaveBeenCalledTimes(2);
 expect(screen.queryByRole('button',{name:'🔊 Reproducir canción de la meta'})).toBeNull();
});

it('a completed previous goal does not suppress the new goal song',async()=>{
 sessionStorage.setItem('toallaton-goal-20000-audio',JSON.stringify({completed:true,position:125}));
 render(<GoalAudio reached donationActive/>);await act(async()=>{});
 expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
});
