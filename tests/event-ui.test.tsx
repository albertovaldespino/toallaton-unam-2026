import React from 'react';
import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,act,cleanup} from '@testing-library/react';
import DonationCelebration from '@/components/DonationCelebration';
import PumaMap from '@/components/PumaMap';
import GoalProgress from '@/components/GoalProgress';
import GoalCelebration from '@/components/GoalCelebration';
import AdminDashboard from '@/components/AdminDashboard';
import PublicScreen from '@/app/pantalla/page';
import Admin from '@/app/admin/page';
import {sedes} from '@/data/sedes';
import type {Donation} from '@/lib/types';
vi.mock('@/components/Fireworks',()=>({fireworks:vi.fn()}));
const effects=vi.hoisted(()=>({launch:vi.fn(),reset:vi.fn()}));
vi.mock('canvas-confetti',()=>({default:{create:()=>Object.assign(effects.launch,{reset:effects.reset})}}));
vi.mock('next/dynamic',()=>({default:()=>()=> <div data-testid="map"/>}));
const donation:Donation={id:'11111111-1111-4111-8111-111111111111',sequence:'1',site_id:'musica',site_name:'Facultad de Música',quantity:500,donor:'Donante de prueba aislada',notes:'Prueba sin base de producción',created_at:'2026-10-02T18:00:00Z'};
const stats=(total=0)=>({total,count:total?1:0,sites:sedes.map(s=>({...s,total:s.id==='musica'?total:0,count:s.id==='musica'&&total?1:0})),latest:total?donation:null});
beforeEach(()=>{vi.useFakeTimers();localStorage.clear();sessionStorage.clear();vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});vi.stubGlobal('matchMedia',()=>({matches:false}));});
afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();vi.clearAllMocks()});
it('Puma loops silently, cannot be unmuted, and has no controls',()=>{
 const {container}=render(<PumaMap/>);const v=container.querySelector('video')!;
 expect(v.muted).toBe(true);expect(v.loop).toBe(true);expect(v.autoplay).toBe(true);expect(v.playsInline).toBe(true);expect(v.controls).toBe(false);
 v.muted=false;fireEvent.volumeChange(v);expect(v.muted).toBe(true);expect(v.getAttribute('src')).toBe('/videos/Puma_transparente_mapa.webm');
});
it('Queen plays with original volume, is not cut at 45 seconds, closes once on ended and stops audio',async()=>{
 const done=vi.fn();const {container,rerender}=render(<DonationCelebration donation={donation} onDone={done}/>);
 await act(async()=>vi.advanceTimersByTimeAsync(5000));const v=container.querySelector('video')!;
 expect(v.muted).toBe(false);expect(v.hasAttribute('muted')).toBe(false);expect(v.volume).toBe(1);expect(v.loop).toBe(false);expect(v.getAttribute('src')).toBe('/videos/gracias-donacion-queen-transparente.webm');
 for(let i=0;i<10;i++){await act(async()=>vi.advanceTimersByTimeAsync(5000));fireEvent.timeUpdate(v)}
 expect(done).not.toHaveBeenCalled();fireEvent.ended(v);fireEvent.ended(v);expect(done).toHaveBeenCalledTimes(1);expect(v.pause).toHaveBeenCalled();
 rerender(<DonationCelebration donation={null} onDone={done}/>);expect(container.querySelector('.celebration-idle')).not.toBeNull();expect(container.querySelector('video')).toBe(v);
});
it('blocked audible autoplay preserves donation until explicit recovery, never falls back to mute',async()=>{
 vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new DOMException('Blocked','NotAllowedError'));
 const done=vi.fn();const {container}=render(<DonationCelebration donation={donation} onDone={done}/>);
 await act(async()=>vi.advanceTimersByTimeAsync(5000));expect(screen.getByRole('button',{name:'🔊 Reproducir con sonido'})).toBeTruthy();
 await act(async()=>vi.advanceTimersByTimeAsync(70000));expect(done).not.toHaveBeenCalled();expect(container.querySelector('video')!.muted).toBe(false);
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'🔊 Reproducir con sonido'})));fireEvent.ended(container.querySelector('video')!);expect(done).toHaveBeenCalledTimes(1);
});
it('goal remains active at or above threshold and cancels effects below it',()=>{
 const {rerender}=render(<><GoalProgress total={15000}/><GoalCelebration active/></>);expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');expect(screen.getByText('¡META ALCANZADA!')).toBeTruthy();expect(effects.launch).toHaveBeenCalled();
 rerender(<><GoalProgress total={15500}/><GoalCelebration active/></>);expect(screen.getByText('META SUPERADA')).toBeTruthy();
 rerender(<><GoalProgress total={11000}/><GoalCelebration active={false}/></>);expect(effects.reset).toHaveBeenCalled();expect(document.querySelector('.goal-fireworks')).toBeNull();
});
it('dashboard includes all 125 donors, pagination, graphs and printable report',()=>{
 const records=Array.from({length:125},(_,i)=>({...donation,id:String(i),donor:i===124?'Último donante':null,quantity:10}));vi.spyOn(window,'print').mockImplementation(()=>{});
 render(<AdminDashboard donations={records} sites={sedes}/>);expect(screen.getByText('Avance hacia 15,000')).toBeTruthy();expect(document.querySelector('.report-footer')?.textContent).toContain('Meta: 15,000 toallas');expect(document.querySelectorAll('.donor-detail tbody tr')).toHaveLength(125);expect(screen.getByText('Último donante')).toBeTruthy();expect(document.querySelector('.site-bars')).toBeTruthy();expect(screen.getByRole('img')).toBeTruthy();fireEvent.click(screen.getByText('Generar informe'));expect(window.print).toHaveBeenCalled();
});
it('public polling queues successful events without duplicates and resets goal after undo',async()=>{
 let events:Donation[]=[],total=0;
 vi.stubGlobal('fetch',vi.fn(async(input:string)=>{if(input.startsWith('/api/donations/latest')){const after=new URL(input,'http://local').searchParams.get('after');return Response.json({cursor:after===null?'0':events.at(-1)?.sequence||after,events:after===null?[]:events.filter(e=>Number(e.sequence)>Number(after))})}return Response.json(stats(total))}));
 render(<PublicScreen/>);await act(async()=>vi.advanceTimersByTimeAsync(1));
 events=[donation,{...donation,id:'22222222-2222-4222-8222-222222222222',sequence:'2'}];total=15000;
 await act(async()=>vi.advanceTimersByTimeAsync(7000));expect(document.querySelector('.screen-goal-reached')).not.toBeNull();const v=document.querySelector<HTMLVideoElement>('video')!;expect(v.muted).toBe(false);
 fireEvent.ended(v);await act(async()=>vi.advanceTimersByTimeAsync(5000));fireEvent.ended(v);await act(async()=>vi.advanceTimersByTimeAsync(6000));expect(document.querySelector('.celebration-idle')).not.toBeNull();
 total=14999;await act(async()=>vi.advanceTimersByTimeAsync(1500));expect(document.querySelector('.screen-goal-reached')).toBeNull();expect(document.querySelector('.goal-fireworks')).toBeNull();
});
it('admin failed save does not publish a donation; successful save keeps selected site and updates dashboard',async()=>{
 let records:Donation[]=[],fail=true;const writes:unknown[]=[];
 vi.stubGlobal('fetch',vi.fn(async(input:string,init?:RequestInit)=>{
 if(input==='/api/stats')return Response.json(stats(records.length?500:0));if(input==='/api/sites')return Response.json(sedes);
 if(init?.method==='POST'){writes.push(JSON.parse(String(init.body)));if(fail)return Response.json({error:'Error controlado'},{status:503});records=[donation];return Response.json(donation,{status:201})}
 return Response.json(records);
 }));
 render(<Admin/>);await act(async()=>vi.advanceTimersByTimeAsync(1));fireEvent.change(screen.getByLabelText('Acceso de administración'),{target:{value:'clave-de-prueba-aislada'}});await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Entrar'})));
 fireEvent.change(screen.getByLabelText('Sede participante'),{target:{value:'musica'}});fireEvent.change(screen.getByLabelText('Cantidad de toallas'),{target:{value:'500'}});fireEvent.click(screen.getByRole('button',{name:'Registrar donación'}));await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Confirmar donación'})));expect(records).toHaveLength(0);expect(screen.getByRole('dialog')).toBeTruthy();
 fail=false;await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Confirmar donación'})));expect(records).toHaveLength(1);expect((writes[0] as {id:string}).id).toBe((writes[1] as {id:string}).id);expect((screen.getByLabelText('Sede participante') as HTMLSelectElement).value).toBe('musica');expect((screen.getByLabelText('Cantidad de toallas') as HTMLInputElement).value).toBe('');expect(screen.getByRole('heading',{name:'DASHBOARD'})).toBeTruthy();
});

it('public sound activation is saved for the session and pauses Queen outside donations',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(input:string)=>Response.json(input.startsWith('/api/donations/latest')?{cursor:'0',events:[]}:stats(0))));
 render(<PublicScreen/>);await act(async()=>vi.advanceTimersByTimeAsync(1));
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'🔊 Activar sonido de celebraciones'})));
 expect(screen.getByRole('button',{name:'🔊 Sonido activado'}).getAttribute('aria-pressed')).toBe('true');
 expect(sessionStorage.getItem('toallaton-celebration-sound')).toBe('enabled');
 expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
 expect(document.querySelector('.celebration-idle')).not.toBeNull();
});
it('public goal shows the real total above target and donor only when present',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(input:string)=>Response.json(input.startsWith('/api/donations/latest')?{cursor:'0',events:[]}:stats(15500))));
 render(<PublicScreen/>);await act(async()=>vi.advanceTimersByTimeAsync(1500));
 expect(screen.getByText('LA UNAM NOS UNE')).toBeTruthy();
 expect(screen.getByText(/TOTAL ALCANZADO.*15,500/)).toBeTruthy();
 expect(screen.getByText('Donativo: Donante de prueba aislada')).toBeTruthy();
 expect(document.querySelector('.screen-goal-reached')).not.toBeNull();
});
it('vertical shares goal state, real total, donor and reverses without a second poller',async()=>{
 let total=14999;
 const fetcher=vi.fn(async(input:string)=>Response.json(input.startsWith('/api/donations/latest')?{cursor:'0',events:[]}:stats(total)));
 vi.stubGlobal('fetch',fetcher);
 const Vertical=(await import('@/app/pantalla-vertical/page')).default;
 render(<Vertical/>);await act(async()=>vi.advanceTimersByTimeAsync(1));
 expect(document.querySelector('.screen-vertical')).not.toBeNull();
 expect(document.querySelector('.screen-goal-reached')).toBeNull();
 expect(fetcher).toHaveBeenCalledTimes(2);
 for (const value of [15000,15250,16000]) {
   total=value;await act(async()=>vi.advanceTimersByTimeAsync(1500));
   expect(document.querySelector('.screen-goal-reached')).not.toBeNull();
   expect(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('100');
 }
 total=8000;await act(async()=>vi.advanceTimersByTimeAsync(1500));
 expect(document.querySelector('.screen-goal-reached')).toBeNull();
 expect(document.querySelector('.goal-fireworks')).toBeNull();
});
it('goal effects emit an extra burst after new donations and clean up intervals',()=>{
 const {rerender,unmount}=render(<GoalCelebration active total={15250}/>);
 effects.launch.mockClear();rerender(<GoalCelebration active total={15350}/>);
 expect(effects.launch).toHaveBeenCalled();unmount();effects.launch.mockClear();
 act(()=>vi.advanceTimersByTime(10000));expect(effects.launch).not.toHaveBeenCalled();
});
