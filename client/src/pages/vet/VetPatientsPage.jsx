import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import AppointmentService from '../../api/appointmentService.js';
import HealthRecordService from '../../api/healthRecordService.js';
import Modal from '../../components/ui/Modal.jsx';

const SPECIES_EMOJI = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', reptile: '🦎', fish: '🐠', other: '🐾' };

export default function VetPatientsPage() {
  const [appointments, setAppointments] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  // Modals state
  const [historyPatient, setHistoryPatient] = useState(null);
  const [addRecordPatient, setAddRecordPatient] = useState(null);
  const [recordForm, setRecordForm] = useState({
    recordType: 'checkup',
    diagnosis: '',
    treatment: '',
    notes: '',
    medications: '',
    followUpDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [apptRes, hrRes] = await Promise.allSettled([
        AppointmentService.getMine({ role: 'vet', limit: 100 }),
        HealthRecordService.getAll(),
      ]);
      if (apptRes.status === 'fulfilled') {
        setAppointments(apptRes.value.data.data || []);
      }
      if (hrRes.status === 'fulfilled') {
        setHealthRecords(hrRes.value.data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aggregate unique patients from appointments
  const patients = useMemo(() => {
    const map = new Map();
    for (const appt of appointments) {
      if (!appt.pet?._id) continue;
      const petId = appt.pet._id;
      if (!map.has(petId)) {
        map.set(petId, {
          pet: appt.pet,
          owner: appt.owner,
          appointments: [appt],
          lastVisit: appt.appointmentDate,
        });
      } else {
        const item = map.get(petId);
        item.appointments.push(appt);
        if (new Date(appt.appointmentDate) > new Date(item.lastVisit)) {
          item.lastVisit = appt.appointmentDate;
        }
      }
    }
    return Array.from(map.values());
  }, [appointments]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter(({ pet, owner }) => {
      const matchesSpecies = speciesFilter === 'all' || pet.species?.toLowerCase() === speciesFilter;
      const matchesSearch =
        !q ||
        pet.name?.toLowerCase().includes(q) ||
        pet.breed?.toLowerCase().includes(q) ||
        owner?.name?.toLowerCase().includes(q) ||
        owner?.phone?.toLowerCase().includes(q);
      return matchesSpecies && matchesSearch;
    });
  }, [patients, search, speciesFilter]);

  // Handle adding health record
  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!addRecordPatient) return;
    setSubmitting(true);
    setActionMsg('');
    try {
      const medsArray = recordForm.medications
        ? recordForm.medications.split('\n').filter(Boolean).map(m => ({ name: m.trim() }))
        : [];

      await HealthRecordService.create({
        petId: addRecordPatient.pet._id,
        recordType: recordForm.recordType,
        diagnosis: recordForm.diagnosis,
        treatment: recordForm.treatment,
        notes: recordForm.notes,
        medications: medsArray,
        followUpDate: recordForm.followUpDate || undefined,
        visitDate: new Date().toISOString(),
      });

      setActionMsg('✓ Medical record saved successfully!');
      setRecordForm({
        recordType: 'checkup',
        diagnosis: '',
        treatment: '',
        notes: '',
        medications: '',
        followUpDate: '',
      });
      await loadData();
      setTimeout(() => {
        setAddRecordPatient(null);
        setActionMsg('');
      }, 1200);
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to save health record');
    } finally {
      setSubmitting(false);
    }
  };

  const patientRecords = useMemo(() => {
    if (!historyPatient) return [];
    return healthRecords.filter(r => (r.pet?._id || r.pet) === historyPatient.pet._id);
  }, [healthRecords, historyPatient]);

  return (
    <DashboardLayout pageTitle="Patients Directory 🐾">
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-6">

        {/* Header banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-muted text-sm font-medium">Veterinary Practice</p>
            <h1 className="text-3xl font-heading font-semibold text-strong">
              Patient <span className="heading-gradient">Directory</span>
            </h1>
            <p className="text-muted text-sm mt-0.5">
              {patients.length} unique patient{patients.length === 1 ? '' : 's'} under your care
            </p>
          </div>
        </div>

        {/* Search & Species Filter Bar */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pet name, breed, or owner…"
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E2D9] rounded-xl text-sm text-body placeholder-[#8A8279] focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { key: 'all', label: 'All Pets' },
              { key: 'dog', label: 'Dogs 🐕' },
              { key: 'cat', label: 'Cats 🐱' },
              { key: 'bird', label: 'Birds 🦜' },
              { key: 'rabbit', label: 'Rabbits 🐰' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSpeciesFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  speciesFilter === key
                    ? 'bg-white border border-primary-300 text-primary-900 font-semibold shadow-sm'
                    : 'text-muted hover:text-body hover:bg-white/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <span className="text-4xl block mb-3">🐾</span>
            <h3 className="text-lg font-heading font-semibold text-strong mb-1">
              {search || speciesFilter !== 'all' ? 'No matching patients found' : 'No patients on file yet'}
            </h3>
            <p className="text-muted text-sm max-w-md mx-auto">
              {search || speciesFilter !== 'all'
                ? 'Try adjusting your search query or species filter.'
                : 'Pets scheduled for appointments with you will automatically appear in your patient directory.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPatients.map(({ pet, owner, appointments: appts, lastVisit }) => (
              <div
                key={pet._id}
                className="glass-card p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top row: Avatar + details */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-13 h-13 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0 border border-primary-200">
                      {SPECIES_EMOJI[pet.species] || '🐾'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base font-heading font-bold text-strong truncate">
                          {pet.name}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium border border-primary-200 capitalize">
                          {pet.species}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate mt-0.5">
                        {pet.breed || 'Mixed'} {pet.age ? `· ${pet.age}` : ''} {pet.gender ? `· ${pet.gender}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Owner Information */}
                  <div className="bg-primary-50/50 rounded-xl p-3 mb-4 border border-[#E8E2D9]/70 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted font-medium">Pet Parent:</span>
                      <span className="text-strong font-semibold truncate ml-2">{owner?.name || 'Unknown'}</span>
                    </div>
                    {owner?.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Contact:</span>
                        <span className="text-body font-mono">{owner.phone}</span>
                      </div>
                    )}
                    {owner?.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Email:</span>
                        <span className="text-muted truncate ml-2 max-w-[150px]">{owner.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Clinical stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                    <div className="bg-white rounded-xl p-2 border border-[#E8E2D9]">
                      <p className="text-xs text-muted">Consultations</p>
                      <p className="text-sm font-bold text-strong mt-0.5">{appts.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-2 border border-[#E8E2D9]">
                      <p className="text-xs text-muted">Last Visit</p>
                      <p className="text-xs font-semibold text-strong mt-0.5">
                        {new Date(lastVisit).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E8E2D9]">
                  <button
                    onClick={() => setHistoryPatient({ pet, owner, appointments: appts })}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-[#D9D4CC] text-body hover:bg-white transition-all text-center"
                  >
                    📋 History
                  </button>
                  <button
                    onClick={() => {
                      setAddRecordPatient({ pet, owner });
                      setActionMsg('');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-all text-center"
                  >
                    + Log Record
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Modal: Medical History ── */}
        <Modal
          isOpen={!!historyPatient}
          onClose={() => setHistoryPatient(null)}
          title={`Clinical History: ${historyPatient?.pet?.name || ''}`}
        >
          {historyPatient && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-200">
                <span className="text-2xl">{SPECIES_EMOJI[historyPatient.pet.species] || '🐾'}</span>
                <div>
                  <h4 className="text-sm font-bold text-strong">
                    {historyPatient.pet.name} ({historyPatient.pet.species})
                  </h4>
                  <p className="text-xs text-muted">
                    Owner: {historyPatient.owner?.name} · {historyPatient.pet.breed || 'Breed unlisted'}
                  </p>
                </div>
              </div>

              {/* Consultation records from health log */}
              <div>
                <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Health Logs & Diagnoses ({patientRecords.length})
                </h5>
                {patientRecords.length === 0 ? (
                  <p className="text-xs text-muted italic bg-white p-3 rounded-xl border border-[#E8E2D9]">
                    No formal health records logged yet for this pet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {patientRecords.map((rec) => (
                      <div key={rec._id} className="p-3 bg-white rounded-xl border border-[#E8E2D9] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary-800 capitalize">
                            {rec.recordType || 'Checkup'}
                          </span>
                          <span className="text-[11px] text-muted">
                            {new Date(rec.visitDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {rec.diagnosis && (
                          <p className="text-xs text-strong">
                            <span className="font-semibold text-muted">Diagnosis:</span> {rec.diagnosis}
                          </p>
                        )}
                        {rec.treatment && (
                          <p className="text-xs text-body">
                            <span className="font-semibold text-muted">Treatment:</span> {rec.treatment}
                          </p>
                        )}
                        {rec.notes && <p className="text-xs text-muted">{rec.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Appointment Visits */}
              <div>
                <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Appointment History ({historyPatient.appointments.length})
                </h5>
                <div className="space-y-2">
                  {historyPatient.appointments.map((a) => (
                    <div key={a._id} className="p-2.5 bg-white rounded-xl border border-[#E8E2D9] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-strong">
                          {new Date(a.appointmentDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          · {a.appointmentTime}
                        </span>
                        <span className="capitalize text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary-100 text-primary-800">
                          {a.status}
                        </span>
                      </div>
                      <p className="text-muted">Reason: {a.reason || 'Routine consultation'}</p>
                      {a.vetNotes && (
                        <p className="text-primary-800 bg-primary-50 p-1.5 rounded text-[11px]">
                          <strong>Clinical notes:</strong> {a.vetNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* ── Modal: Add Health Record ── */}
        <Modal
          isOpen={!!addRecordPatient}
          onClose={() => setAddRecordPatient(null)}
          title={`Log Clinical Record: ${addRecordPatient?.pet?.name || ''}`}
        >
          {addRecordPatient && (
            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-body block mb-1">Record Type</label>
                  <select
                    value={recordForm.recordType}
                    onChange={(e) => setRecordForm((p) => ({ ...p, recordType: e.target.value }))}
                    className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-body focus:outline-none focus:border-primary-500"
                  >
                    <option value="checkup">General Checkup</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="surgery">Surgery / Procedure</option>
                    <option value="dental">Dental</option>
                    <option value="emergency">Emergency Visit</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-body block mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={recordForm.followUpDate}
                    onChange={(e) => setRecordForm((p) => ({ ...p, followUpDate: e.target.value }))}
                    className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-body focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-body block mb-1">Diagnosis *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mild ear canal infection, healthy vitals"
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm((p) => ({ ...p, diagnosis: e.target.value }))}
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-body focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-body block mb-1">Treatment Administered</label>
                <input
                  type="text"
                  placeholder="e.g. Ear cleaned, topical drops applied"
                  value={recordForm.treatment}
                  onChange={(e) => setRecordForm((p) => ({ ...p, treatment: e.target.value }))}
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-body focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-body block mb-1">Prescriptions (one per line)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Otic drops twice daily for 5 days&#10;Multivitamin chewable"
                  value={recordForm.medications}
                  onChange={(e) => setRecordForm((p) => ({ ...p, medications: e.target.value }))}
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-body focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-body block mb-1">Clinical Notes & Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Advice for the pet parent, dietary considerations, etc."
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-body focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              {actionMsg && (
                <p className={`text-xs font-medium ${actionMsg.startsWith('✓') ? 'text-primary-700' : 'text-[#8C4238]'}`}>
                  {actionMsg}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddRecordPatient(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium border border-[#E8E2D9] text-muted hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary text-xs py-2 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Save Health Record'}
                </button>
              </div>
            </form>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
}
