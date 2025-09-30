import React, { useState } from 'react'
import SignaturePad from '../components/SignaturePad'
import { authFetch } from '../services/authService'

export default function EConsent(){
  const [sig, setSig] = useState<string>('')
  const [status,setStatus] = useState<string>('')
  async function submit(){
    const payload = { patientId: 'pat-001', procedure: 'Transfusión', signature: sig }
    const res = await authFetch('/api/consent', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    setStatus(await res.text())
  }
  return (
    <div className="card">
      <h2>E-Consentimiento</h2>
      <p>Firma aquí para confirmar su consentimiento informado.</p>
      <SignaturePad onChange={setSig}/>
      <button className="button" onClick={submit} disabled={!sig}>Firmar</button>
      <div style={{marginTop:12}}>{status}</div>
    </div>
  )
}
