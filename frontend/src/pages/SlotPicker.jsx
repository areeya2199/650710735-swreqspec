import { useEffect, useState } from 'react'
import { api } from '../api/client'

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function formatSlotTime(startTime) {
  return String(startTime).slice(0, 5)
}

// แสดงช่วงเวลาว่างและที่นั่งคงเหลือตาม FR-BKG-01
export default function SlotPicker({ apiClient = api }) {
  const [packageCode, setPackageCode] = useState('')
  const [dateFrom, setDateFrom] = useState(todayString)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    apiClient
      .getSlots({ dateFrom, packageCode })
      .then((result) => {
        if (!active) return
        setSlots(Array.isArray(result) ? result : result.slots ?? [])
      })
      .catch(() => {
        if (active) setError('ไม่สามารถโหลดช่วงเวลาว่างได้')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [apiClient, dateFrom, packageCode])

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <section className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Booking</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">เลือกแพ็กเกจและช่วงเวลาตรวจ</h1>
          <p className="mt-3 max-w-2xl text-slate-600">เลือกแพ็กเกจและวันที่เพื่อดูช่วงเวลาที่ว่างภายใน 30 วันข้างหน้า</p>
        </header>

        <div className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            แพ็กเกจ
            <input
              aria-label="แพ็กเกจ"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              placeholder="รหัสแพ็กเกจ"
              type="text"
              value={packageCode}
              onChange={(event) => setPackageCode(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            วันที่เริ่มค้นหา
            <input
              aria-label="วันที่เริ่มค้นหา"
              className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </label>
        </div>

        <section className="mt-6" aria-live="polite">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">ช่วงเวลาที่ว่าง</h2>
            <span className="text-sm text-slate-500">เหลือที่นั่ง</span>
          </div>
          {loading && <p className="rounded-xl bg-white p-5 text-slate-600 ring-1 ring-slate-200">กำลังโหลดช่วงเวลา...</p>}
          {error && <p className="rounded-xl bg-red-50 p-5 text-red-700 ring-1 ring-red-200">{error}</p>}
          {!loading && !error && slots.length === 0 && (
            <p className="rounded-xl bg-white p-5 text-slate-600 ring-1 ring-slate-200">ไม่พบช่วงเวลาที่ว่าง</p>
          )}
          {!loading && !error && slots.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => (
                <button
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-500 hover:shadow-md"
                  key={slot.id}
                  type="button"
                >
                  <span>
                    <span className="block font-semibold">{slot.slot_date}</span>
                    <span className="mt-1 block text-lg text-teal-800">{formatSlotTime(slot.start_time)} น.</span>
                  </span>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">
                    {slot.remaining}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}