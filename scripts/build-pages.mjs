import {cp, mkdir, readdir, readFile, writeFile, rm, lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const output=path.resolve(root,'_site');
// Only the generated output directory inside this checkout may be cleared.
if(path.dirname(output)!==root||path.basename(output)!=='_site')throw new Error('Invalid output directory');
const previous=await lstat(output).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
if(previous?.isSymbolicLink())throw new Error('Output must not be a symlink');
if(previous)await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});

const projects=[];
for(const entry of await readdir(root,{withFileTypes:true})){
  if(!entry.isDirectory()||entry.name.startsWith('.')||entry.name==='_site'||entry.name==='node_modules')continue;
  const source=path.join(root,entry.name,'dist');
  try{await readFile(path.join(source,'index.html'));}
  catch(error){if(error.code==='ENOENT'||error.code==='ENOTDIR')continue;throw error;}
  await cp(source,path.join(output,entry.name),{recursive:true,errorOnExist:true,force:false});
  projects.push(entry.name);
}
if(!projects.includes('fish-gather'))throw new Error('Default fish-gather project is missing');
await cp(path.join(root,'index.html'),path.join(output,'index.html'));
await writeFile(path.join(output,'.nojekyll'),'');
console.log(JSON.stringify({output,projects}));
