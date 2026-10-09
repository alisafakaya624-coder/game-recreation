// Supported historical-style edits. Indices run left-to-right, top-to-bottom.
export function validEdit(type,removed){
 const cells=type==='wall'?9:4;
 if(!['wall','floor','ramp','roof'].includes(type)||[...removed].some(n=>!Number.isInteger(n)||n<0||n>=cells))return false;
 const s=[...removed].sort((a,b)=>a-b).join(',');if(!s)return true;
 if(type==='wall')return ['4','3','5','4,7','3,6','5,8','6,7,8','3,4,5,6,7,8','0,3,6','2,5,8','0,1,3','1,2,5','3,6,7','5,7,8','0,1,2,3,4,5'].includes(s);
 if(type==='floor'||type==='roof')return removed.size<=3;
 return s==='0,2'||s==='1,3';
}
