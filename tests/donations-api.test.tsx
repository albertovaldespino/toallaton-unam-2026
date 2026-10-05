// The API test uses an isolated database adapter, never production data.
import {beforeEach,expect,it,vi} from 'vitest';
const queries=vi.hoisted(()=>({text:[] as string[],rows:Array.from({length:125},(_,i)=>({id:String(i)}))}));
vi.mock('@/lib/db',()=>({db:()=>async(strings:TemplateStringsArray)=>{const query=strings.join('?');queries.text.push(query);return query.includes('LIMIT 100')?queries.rows.slice(0,100):queries.rows}}));
vi.mock('@/lib/http',()=>({authorized:(req:Request)=>req.headers.get('x-admin-password')==='isolated-test',forbidden:()=>Response.json({error:'Unauthorized'},{status:401}),failure:()=>Response.json({error:'Failure'},{status:503})}));
import {GET} from '@/app/api/donations/route';
beforeEach(()=>{queries.text.length=0});
it('requires authentication before returning donor details',async()=>{expect((await GET(new Request('http://local/api/donations?all=1'))).status).toBe(401);expect(queries.text).toHaveLength(0)});
it('preserves latest-100 response and provides all records for authenticated dashboard',async()=>{
 const headers={'x-admin-password':'isolated-test'};
 const latest=await GET(new Request('http://local/api/donations',{headers}));expect(await latest.json()).toHaveLength(100);
 const all=await GET(new Request('http://local/api/donations?all=1',{headers}));expect(await all.json()).toHaveLength(125);expect(all.headers.get('cache-control')).toBe('private, no-store');expect(queries.text.every(q=>q.includes('deleted_at IS NULL'))).toBe(true);
});
