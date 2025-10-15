import React, { useEffect, useRef, useState } from "react";
import { generatePatientPDF } from "./PDFGenerator";

const defaultDoctorEn = `Dr. Mohammed Fasiullah Quadri
BUMS (NTR UHS) | Unani Physician
Reg. No: 342/U Govt. of TG
Hafiz, Qari – Jamia Nizamia`;

const initialPatientTemplate = (lang="en") => ({
  id: null,
  serial: "",
  patientName: "",
  age: "",
  gender: "",
  address: "",
  phone: "",
  complaint: "",
  history: "",
  pulse: "",
  diagnosis: "",
  treatment: "",
  smoking: { value: null, details: "" },
  nightfall: { value: null, details: "" },
  femaleSpecific: { isPregnant: { value: null, details: "" }, lastPeriod: "" },
  doctor: defaultDoctorEn,
  date: new Date().toLocaleDateString("en-US"),
});

export default function App(){
  const [lang, setLang] = useState("en");
  const [dir, setDir] = useState("ltr");
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialPatientTemplate("en"));
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState({ personal:true, medical:false, male:false, female:false, treatment:false });
  const previewRef = useRef(null);

  useEffect(()=>{
    const saved = localStorage.getItem("taqi_records_v2");
    if(saved) setRecords(JSON.parse(saved));
  },[]);

  useEffect(()=>{ localStorage.setItem("taqi_records_v2", JSON.stringify(records)); },[records]);
  useEffect(()=>{ document.documentElement.dir = dir; },[dir]);

  const toggleLang = () => {
    const newLang = lang === "ur" ? "en" : "ur";
    setLang(newLang);
    setDir(newLang === "ur" ? "rtl" : "ltr");
    setForm(f => ({ ...f, doctor: newLang === "ur" ? f.doctor : f.doctor }));
  };

  const handleChange = (e) => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); };
  const handleStructured = (path, key, value) => { setForm(f => ({ ...f, [path]: { ...f[path], [key]: value } })); };

  const saveRecord = () => {
    if(!form.patientName){ alert("Patient name required"); return; }
    if(!form.id){
      const id = Date.now();
      setRecords(r => [{...form, id, serial: `THC-${String(r.length+1).padStart(4,'0')}`}, ...r]);
      setForm(f => ({...f, id: Date.now()}));
      alert("Saved");
    } else {
      setRecords(r => r.map(x => x.id === form.id ? form : x));
      alert("Updated");
    }
  };

  const editRecord = (id) => { const rec = records.find(r => r.id === id); if(rec) setForm(rec); };
  const deleteRecord = (id) => { if(!window.confirm("Confirm delete?")) return; setRecords(r => r.filter(x => x.id !== id)); if(form.id === id) setForm(initialPatientTemplate(lang)); };
  const newForm = () => setForm(initialPatientTemplate(lang));
  const filtered = records.filter(r => { const q = query.toLowerCase(); return !q || (r.patientName && r.patientName.toLowerCase().includes(q)) || (r.phone && r.phone.includes(q)) || (r.serial && r.serial.toLowerCase().includes(q)); });

  const renderYesNo = (label, path) => (
    <div style={{marginBottom:8}}>
      <div style={{fontWeight:600}}>{label}</div>
      <div style={{display:'flex', gap:8, marginTop:6}}>
        <label><input type="radio" name={path+"val"} checked={form[path].value===true} onChange={()=>handleStructured(path,'value', true)} /> {lang==='ur' ? 'ہاں' : 'Yes'}</label>
        <label><input type="radio" name={path+"val"} checked={form[path].value===false} onChange={()=>handleStructured(path,'value', false)} /> {lang==='ur' ? 'نہیں' : 'No'}</label>
      </div>
      <textarea placeholder={lang==='ur' ? 'تفصیلات (اگر کوئی)' : 'Details (if any)'} value={form[path].details} onChange={(e)=>handleStructured(path,'details', e.target.value)} style={{marginTop:6}} />
    </div>
  );

  const exportPDF = async (rec=null) => {
    const original = {...form};
    if(rec){ setForm(rec); await new Promise(res => setTimeout(res, 250)); }
    await generatePatientPDF({ elementToRender: previewRef.current, patient: rec || form, lang });
    if(rec){ setForm(original); await new Promise(res => setTimeout(res, 120)); }
  };

  const toggle = (s) => setOpenSections(o => ({ ...o, [s]: !o[s] }));

  return (
    <div className="app" style={{direction:dir}}>
      <div className="header">
        <div>
          <div className="title">{lang==='ur' ? "تقی ہربل کلینک" : "TAQI HERBAL CLINIC"}</div>
          <div style={{color:'#6b7280'}}>{lang==='ur' ? "علاج جڑی بوٹیوں کے ذریعے" : "Herbal Treatment"}</div>
        </div>

        <div className="controls">
          <input placeholder={lang==='ur' ? 'تلاش کریں: نام/فون/سیرئیل' : 'Search: name/phone/serial'} value={query} onChange={e=>setQuery(e.target.value)} />
          <button onClick={toggleLang}>{lang==='ur' ? 'EN' : 'اردو'}</button>
          <button onClick={newForm}>New</button>
          <button onClick={()=>exportPDF(null)}>PDF (This)</button>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Patients ({records.length})</h3>
          <div style={{marginTop:12, maxHeight:600, overflowY:'auto'}}>
            {filtered.map(r => (
              <div key={r.id} className="patient-card">
                <div>
                  <div style={{fontWeight:700}}>{r.patientName}</div>
                  <div style={{color:'#6b7280', fontSize:12}}>{r.serial} • {r.date}</div>
                </div>
                <div style={{display:'flex', gap:6}}>
                  <button onClick={()=>editRecord(r.id)}>Edit</button>
                  <button onClick={()=>exportPDF(r)}>PDF</button>
                  <button onClick={()=>deleteRecord(r.id)} style={{color:'red'}}>Delete</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{color:'#6b7280'}}>No records</div>}
          </div>
        </div>

        <div>
          <div className="card" style={{marginBottom:12}}>
            <div className="form-section">
              <div className="accordion-head" onClick={()=>toggle('personal')}>
                <div>Personal</div>
                <div>{openSections.personal ? '▲' : '▼'}</div>
              </div>
              {openSections.personal && (
                <div style={{marginTop:8}}>
                  <input className="input" name="patientName" placeholder={'Patient name'} value={form.patientName} onChange={(e)=>setForm(f=>({...f, patientName:e.target.value}))} />
                  <div style={{display:'flex', gap:8, marginTop:8}}>
                    <input className="input" name="age" placeholder={'Age'} value={form.age} onChange={(e)=>setForm(f=>({...f, age:e.target.value}))} />
                    <select className="input" name="gender" value={form.gender} onChange={(e)=>setForm(f=>({...f, gender:e.target.value}))}>
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <input className="input" name="phone" placeholder={'Phone'} value={form.phone} onChange={(e)=>setForm(f=>({...f, phone:e.target.value}))} />
                  <input className="input" name="address" placeholder={'Address'} value={form.address} onChange={(e)=>setForm(f=>({...f, address:e.target.value}))} />
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="accordion-head" onClick={()=>toggle('medical')}>
                <div>Medical Details</div>
                <div>{openSections.medical ? '▲' : '▼'}</div>
              </div>
              {openSections.medical && (
                <div style={{marginTop:8}}>
                  <textarea placeholder={'Complaint / Illness'} value={form.complaint} onChange={(e)=>setForm(f=>({...f, complaint:e.target.value}))} />
                  <textarea placeholder={'Medical history'} value={form.history} onChange={(e)=>setForm(f=>({...f, history:e.target.value}))} />
                  <input className="input" name="pulse" placeholder={'Pulse / Exam'} value={form.pulse} onChange={(e)=>setForm(f=>({...f, pulse:e.target.value}))} />
                  <input className="input" name="diagnosis" placeholder={'Diagnosis'} value={form.diagnosis} onChange={(e)=>setForm(f=>({...f, diagnosis:e.target.value}))} />
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="accordion-head" onClick={()=>toggle('male')}>
                <div>Male-specific</div>
                <div>{openSections.male ? '▲' : '▼'}</div>
              </div>
              {openSections.male && (
                <div style={{marginTop:8}}>
                  {renderYesNo('Nightfall','nightfall')}
                  {renderYesNo('Smoking','smoking')}
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="accordion-head" onClick={()=>toggle('female')}>
                <div>Female-specific</div>
                <div>{openSections.female ? '▲' : '▼'}</div>
              </div>
              {openSections.female && (
                <div style={{marginTop:8}}>
                  {renderYesNo('Pregnant','femaleSpecific')}
                  <input className="input" placeholder={'Last period'} value={form.femaleSpecific.lastPeriod} onChange={e=>setForm(f=>({...f, femaleSpecific:{...f.femaleSpecific, lastPeriod:e.target.value}}))} />
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="accordion-head" onClick={()=>toggle('treatment')}>
                <div>Treatment / Prescription</div>
                <div>{openSections.treatment ? '▲' : '▼'}</div>
              </div>
              {openSections.treatment && (
                <div style={{marginTop:8}}>
                  <textarea placeholder={'Treatment / Prescription'} value={form.treatment} onChange={(e)=>setForm(f=>({...f, treatment:e.target.value}))} />
                  <textarea placeholder={'Doctor name & details'} value={form.doctor} onChange={(e)=>setForm(f=>({...f, doctor:e.target.value}))} />
                </div>
              )}
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <button onClick={saveRecord}>Save</button>
              <button onClick={()=>exportPDF(null)}>Generate PDF</button>
            </div>
          </div>

          <div className="card">
            <h4>Preview (what will be in PDF)</h4>
            <div ref={previewRef} style={{padding:12, background:'#fff', borderRadius:8}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontSize:20, fontWeight:700, color:'#0f9d58'}}>TAQI HERBAL CLINIC</div>
                  <div style={{color:'#6b7280', fontSize:12}}>Herbal Treatment</div>
                </div>
                <div style={{textAlign: dir === 'rtl' ? 'right' : 'left', fontSize:12}}>
                  <div>{`Date: ${form.date}`}</div>
                  <div style={{whiteSpace:'pre-line', marginTop:6}}>{form.doctor}</div>
                </div>
              </div>

              <hr style={{margin:'12px 0'}} />

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                <div>
                  <div style={{fontSize:12,color:'#6b7280'}}>Patient</div>
                  <div style={{fontWeight:700}}>{form.patientName || '---'}</div>
                </div>
                <div>
                  <div style={{fontSize:12,color:'#6b7280'}}>Age / Gender</div>
                  <div style={{fontWeight:700}}>{form.age || '--'} / {form.gender || '--'}</div>
                </div>

                <div style={{gridColumn:'1 / -1'}}>
                  <div style={{fontSize:12,color:'#6b7280'}}>Address</div>
                  <div style={{fontWeight:700}}>{form.address || '---'}</div>
                </div>

                <div>
                  <div style={{fontSize:12,color:'#6b7280'}}>Phone</div>
                  <div style={{fontWeight:700}}>{form.phone || '---'}</div>
                </div>

                <div style={{gridColumn:'1 / -1'}}>
                  <div style={{fontSize:12,color:'#6b7280'}}>Complaint</div>
                  <div style={{whiteSpace:'pre-line'}}>{form.complaint || '---'}</div>
                </div>

                <div style={{gridColumn:'1 / -1'}}>
                  <div style={{fontSize:12,color:'#6b7280'}}>History</div>
                  <div style={{whiteSpace:'pre-line'}}>{form.history || '---'}</div>
                </div>

                <div>
                  <div style={{fontSize:12,color:'#6b7280'}}>Pulse</div>
                  <div>{form.pulse || '---'}</div>
                </div>
                <div>
                  <div style={{fontSize:12,color:'#6b7280'}}>Diagnosis</div>
                  <div>{form.diagnosis || '---'}</div>
                </div>

                <div style={{gridColumn:'1 / -1'}}>
                  <div style={{fontSize:12,color:'#6b7280'}}>Treatment</div>
                  <div style={{whiteSpace:'pre-line'}}>{form.treatment || '---'}</div>
                </div>
              </div>

              <div style={{marginTop:16, textAlign: dir==='rtl' ? 'right' : 'left' }}>
                <div style={{fontSize:12, color:'#6b7280'}}>Signature / دستخط</div>
                <div style={{marginTop:20}}>__________________________</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
