"use client";

import { useState } from "react";
import {
  Buildings, CheckCircle, EnvelopeSimple, Key, PencilSimple, ShieldCheck, Trash, UserPlus, UsersThree, X,
} from "@phosphor-icons/react";

export function TeamManagement() {
  const [members, setMembers] = useState<Array<{ name: string; email: string; initials: string; role: string; scope: string; status: string }>>([]);
  const [inviting, setInviting] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const selectedMember = members.find(member => member.email === selectedEmail);
  const notify = (value: string) => {
    setNotice(value);
    window.setTimeout(() => setNotice(null), 2600);
  };
  function invite(form: FormData) {
    const email = String(form.get("email")); const role = String(form.get("role"));
    const scope = String(form.get("scope") ?? "All operating brands");
    setMembers(current => [...current, { name: email.split("@")[0], email, initials: email.slice(0, 2).toUpperCase(), role, scope, status: "Invited" }]);
    setInviting(false);
    notify("Invitation drafted. Review access anytime from Team & access.");
  }
  function updateSelected(form: FormData) {
    if (!selectedMember) return;
    const role = String(form.get("role"));
    const scope = String(form.get("scope"));
    const status = String(form.get("status"));
    setMembers(current => current.map(member => member.email === selectedMember.email ? { ...member, role, scope, status } : member));
    setSelectedEmail(null);
    notify(`${selectedMember.name} access updated.`);
  }
  function removeSelected() {
    if (!selectedMember) return;
    setMembers(current => current.filter(member => member.email !== selectedMember.email));
    setSelectedEmail(null);
    notify(`${selectedMember.name} removed from this workspace.`);
  }
  return <div className="app-content"><header className="app-page-head"><div><span>Workspace governance</span><h1>Team & access</h1><p>Company owners can invite users, assign roles, and limit access by brand or business unit.</p></div><button className="button button-dark" onClick={() => setInviting(true)} type="button"><UserPlus /> Invite member</button></header><section className="access-summary"><article className="surface"><UsersThree /><span><strong>{members.length}</strong>members and invitations</span></article><article className="surface"><ShieldCheck /><span><strong>7 roles</strong>least-privilege access</span></article><article className="surface"><Key /><span><strong>Brand scopes</strong>per-user access</span></article></section><section className="surface table-wrap"><div className="surface-head"><h2>Workspace members</h2><span>Invite members, then assign role and brand access.</span></div>{members.length ? <table className="data-table team-table"><thead><tr><th>Member</th><th>Role</th><th>Brand access</th><th>Status</th><th>Action</th></tr></thead><tbody>{members.map(member => <tr key={member.email}><td><span className="member-cell"><b>{member.initials}</b><span><strong>{member.name}</strong><small>{member.email}</small></span></span></td><td><select aria-label={`Role for ${member.name}`} value={member.role} onChange={event => { setMembers(current => current.map(item => item.email === member.email ? { ...item, role: event.target.value } : item)); notify(`${member.name} role changed to ${event.target.value}.`); }}><option>Owner</option><option>Org Admin</option><option>Campaign Manager</option><option>Reviewer</option><option>Finance</option><option>Analyst</option></select></td><td><span className="team-scope"><Buildings weight="duotone" />{member.scope}</span></td><td><span className={`status-pill ${member.status === "Invited" ? "neutral" : ""}`}>{member.status}</span></td><td><div className="team-actions"><button className="table-action" type="button" onClick={() => setSelectedEmail(member.email)}><PencilSimple /> Manage</button>{member.status === "Invited" && <button className="table-action" type="button" onClick={() => notify(`Invitation resent to ${member.email}.`)}><EnvelopeSimple /> Resend</button>}</div></td></tr>)}</tbody></table> : <div className="import-empty compact"><UsersThree weight="duotone" /><p>No team members have been invited from this screen yet. Invite a teammate to configure role and brand access.</p></div>}</section><section className="permission-note surface"><ShieldCheck weight="duotone" /><div><h2>Role-ready by design</h2><p>Owner, Org Admin, Campaign Manager, Reviewer, Finance, Analyst, and Creator permissions are designed for server-side enforcement. A person can have different access in each operating brand.</p></div></section>{inviting && <div className="dialog-backdrop" onMouseDown={() => setInviting(false)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="invite-member-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" onClick={() => setInviting(false)} type="button" aria-label="Close"><X /></button><span className="section-kicker">Secure invitation</span><h2 id="invite-member-title">Invite a team member</h2><form className="dialog-form" action={invite}><label className="field"><span>Work email</span><input type="email" name="email" required autoFocus placeholder="name@company.com" /></label><label className="field"><span>Role</span><select name="role"><option>Campaign Manager</option><option>Reviewer</option><option>Finance</option><option>Analyst</option><option>Org Admin</option></select></label><label className="field"><span>Brand access</span><select name="scope" defaultValue="All operating brands"><option>Active brand only</option><option>All operating brands</option></select></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => setInviting(false)}>Cancel</button><button className="button button-dark" type="submit"><EnvelopeSimple /> Send invitation</button></div></form></section></div>}{selectedMember && <div className="dialog-backdrop" onMouseDown={() => setSelectedEmail(null)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="member-access-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" onClick={() => setSelectedEmail(null)} type="button" aria-label="Close"><X /></button><span className="section-kicker">Member access</span><h2 id="member-access-title">{selectedMember.name}</h2><p>{selectedMember.email}</p><form className="dialog-form" action={updateSelected}><label className="field"><span>Role</span><select name="role" defaultValue={selectedMember.role}><option>Owner</option><option>Org Admin</option><option>Campaign Manager</option><option>Reviewer</option><option>Finance</option><option>Analyst</option></select></label><label className="field"><span>Brand access</span><select name="scope" defaultValue={selectedMember.scope}><option>Active brand only</option><option>All operating brands</option></select></label><label className="field"><span>Status</span><select name="status" defaultValue={selectedMember.status}><option>Active</option><option>Invited</option><option>Suspended</option></select></label><div className="dialog-actions split"><button className="button button-danger" type="button" onClick={removeSelected}><Trash /> Remove</button><span /><button className="button button-outline" type="button" onClick={() => setSelectedEmail(null)}>Cancel</button><button className="button button-dark" type="submit"><CheckCircle weight="fill" /> Save access</button></div></form></section></div>}{notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}</div>;
}
