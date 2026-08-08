import fs from 'node:fs';
import path from 'node:path';

export const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));

export async function ensureOk(response:Response,label:string) {
  if (response.ok) return response;
  const body = await response.text().catch(()=> '');
  throw new Error(`${label} failed: HTTP ${response.status} ${response.statusText}\n${body}`);
}

export async function downloadFile(url:string,outputPath:string,headers?:Record<string,string>) {
  const response = await fetch(url,{headers});
  await ensureOk(response,`Download ${url}`);
  fs.mkdirSync(path.dirname(outputPath),{recursive:true});
  fs.writeFileSync(outputPath,new Uint8Array(await response.arrayBuffer()));
  return outputPath;
}

export function writeBinary(outputPath:string,data:ArrayBuffer) {
  fs.mkdirSync(path.dirname(outputPath),{recursive:true});
  fs.writeFileSync(outputPath,new Uint8Array(data));
  return outputPath;
}
