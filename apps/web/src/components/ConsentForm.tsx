import React, { useRef, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

type ConsentState = { treatment:boolean; dataProtection:boolean; highRiskProcedures:boolean; signature?:string };

export default function ConsentForm({onReady}:{onReady:(docRef:{pdfBytes:Uint8Array; hash:string; qrDataUrl:string})=>void}){
  const [c, setC] = useState<ConsentState>({ treatment:false, dataProtection:false, highRiskProcedures:false });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function drawSig(e:React.MouseEvent){
    if (e.buttons !== 1) return;
    const cvs = canvasRef.current!; const ctx = cvs.getContext("2d")!;
    const rect = cvs.getBoundingClientRect();
    ctx.fillStyle = "black";
    ctx.fillRect(e.clientX-rect.left, e.clientY-rect.top, 2, 2);
  }
  function clearSig(){ const ctx=canvasRef.current!.getContext("2d")!; ctx.clearRect(0,0,canvasRef.current!.width,canvasRef.current!.height); }

  async function generate(){
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const drawText=(t:string, x:number, y:number, s=12)=> page.drawText(t, { x, y, size:s, font, color: rgb(0,0,0)});

    drawText("Consentimiento", 50, 800, 18);
    drawText(`Tratamiento: ${c.treatment ? "Sí":"No"}`, 50, 770);
    drawText(`Protección de datos: ${c.dataProtection ? "Sí":"No"}`, 50, 750);
    drawText(`Procedimientos de riesgo: ${c.highRiskProcedures ? "Sí":"No"}`, 50, 730);

    const sigData = canvasRef.current!.toDataURL("image/png");
    const pngBytes = await fetch(sigData).then(r=>r.arrayBuffer());
    const png = await pdf.embedPng(pngBytes);
    page.drawImage(png, { x:50, y:640, width:300, height:100 });

    const pdfBytes = await pdf.save();
    const hash = await sha256(pdfBytes);
    const qrDataUrl = await QRCode.toDataURL(`hash:${hash}`);

    onReady({ pdfBytes, hash, qrDataUrl });
  }

  return (
    <div className="space-y-2">
      <label><input type="checkbox" checked={c.treatment} onChange={e=>setC({...c, treatment:e.target.checked})}/> Acepto tratamiento</label><br/>
      <label><input type="checkbox" checked={c.dataProtection} onChange={e=>setC({...c, dataProtection:e.target.checked})}/> Acepto protección de datos</label><br/>
      <label><input type="checkbox" checked={c.highRiskProcedures} onChange={e=>setC({...c, highRiskProcedures:e.target.checked})}/> Acepto procedimientos de riesgo</label>

      <div>
        <div className="text-sm opacity-70 mb-1">Firma:</div>
        <canvas ref={canvasRef} width={520} height={120} className="border" onMouseMove={drawSig}></canvas>
        <div className="mt-2 flex gap-2">
          <button className="border rounded px-3 py-1" onClick={clearSig}>Limpiar</button>
          <button className="border rounded px-3 py-1" onClick={generate}>Generar PDF + Hash + QR</button>
        </div>
      </div>
    </div>
  );
}

async function sha256(bytes:Uint8Array){
  const buff = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buff)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
