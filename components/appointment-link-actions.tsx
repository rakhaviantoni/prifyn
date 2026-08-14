"use client";

import { CalendarBlank, CheckCircle, XCircle } from "@phosphor-icons/react";
import { FormEvent, useEffect, useState } from "react";

type Booking = { companyName: string; contactName: string; requestedDate: string; startTime: string; endTime: string; timezone: string; status: string };

export function AppointmentLinkActions({ token, mode }: { token: string; mode: "reschedule" | "cancel" }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [status, setStatus] = useState("Loading booking…");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const response = await fetch(`/api/public/appointments/${token}`);
      const data = await response.json().catch(() => ({})) as { booking?: Booking; error?: string };
      if (!active) return;
      if (response.ok && data.booking) {
        setBooking(data.booking);
        setStatus("");
      } else {
        setStatus(data.error || "This booking link could not be opened.");
      }
    })();
    return () => { active = false; };
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus(mode === "cancel" ? "Cancelling appointment…" : "Sending reschedule request…");
    const response = await fetch(`/api/public/appointments/${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: mode, preferredDate: form.get("preferredDate"), note: form.get("note") }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (response.ok) {
      setDone(true);
      setStatus(mode === "cancel" ? "Your appointment has been cancelled." : "Your reschedule request has been sent.");
    } else {
      setStatus(data.error || "This request could not be completed.");
    }
  }

  return (
    <section className="surface appointment-token-card">
      <div className="intake-form-head">
        <span>{mode === "cancel" ? <XCircle weight="duotone" /> : <CalendarBlank weight="duotone" />}</span>
        <div>
          <small>{mode === "cancel" ? "Cancel appointment" : "Reschedule appointment"}</small>
          <h2>{mode === "cancel" ? "Cancel your PRIFYN walkthrough" : "Request another walkthrough time"}</h2>
          <p>{booking ? `${booking.companyName} · ${booking.requestedDate} · ${booking.startTime}–${booking.endTime} ${booking.timezone}` : status}</p>
        </div>
      </div>
      {booking && !done && (
        <form className="public-intake-form" onSubmit={submit}>
          {mode === "reschedule" && <label className="field"><span>Preferred new date</span><input name="preferredDate" type="date" required /></label>}
          <label className="field"><span>{mode === "cancel" ? "Reason or note" : "Anything PRIFYN should know?"}</span><textarea name="note" placeholder="Optional note for the PRIFYN team" /></label>
          <button className={`button ${mode === "cancel" ? "button-outline" : "button-dark"} button-large`} type="submit">{mode === "cancel" ? "Cancel appointment" : "Request reschedule"}</button>
        </form>
      )}
      {status && <div className={`intake-success ${done ? "" : "compact"}`} role="status"><CheckCircle weight="fill" /><span><strong>{status}</strong><small>{done ? "The PRIFYN team will follow up if anything else is needed." : "Please wait a moment."}</small></span></div>}
    </section>
  );
}
