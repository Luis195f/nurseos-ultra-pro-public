export type AVPU = "A" | "V" | "P" | "U";
export interface Input { rr:number; spo2:number; sbp:number; hr:number; temp:number; avpu:AVPU; o2:boolean; }
export interface Output { score:number; band:"baja"|"media"|"alta"; }

function scoreRR(rr:number){ if(rr<=8) return 3; if(rr<=11) return 1; if(rr<=20) return 0; if(rr<=24) return 2; return 3; }
function scoreSpO2(s:number){ if(s>=96) return 0; if(s>=94) return 1; if(s>=92) return 2; return 3; }
function scoreSBP(p:number){ if(p<=90) return 3; if(p<=100) return 2; if(p<=110) return 1; if(p<=219) return 0; return 3; }
function scoreHR(h:number){ if(h<=40) return 3; if(h<=50) return 1; if(h<=90) return 0; if(h<=110) return 1; if(h<=130) return 2; return 3; }
function scoreTemp(t:number){ if(t<=35) return 3; if(t<=36) return 1; if(t<=38) return 0; if(t<=39) return 1; return 2; }
function scoreAVPU(a:AVPU){ return a==="A" ? 0 : 3; }

export function calculate(input: Input): Output {
  let score = scoreRR(input.rr)+scoreSpO2(input.spo2)+scoreSBP(input.sbp)+scoreHR(input.hr)+scoreTemp(input.temp)+scoreAVPU(input.avpu);
  if (input.o2) score += 2;
  const band = score >= 7 ? "alta" : score >= 5 ? "media" : "baja";
  return { score, band };
}
