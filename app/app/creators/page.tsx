import { Plus, SealCheck } from "@phosphor-icons/react/dist/ssr";

const creators = [
  ["Nabila Putri", "@nabilaeats", "TikTok · Instagram", "87%", "2.8×", "Verified"],
  ["Ardian Prakoso", "@ardianfamily", "Instagram · YouTube", "81%", "3.1×", "Verified"],
  ["Dimas Wibowo", "@dimastries", "TikTok", "76%", "2.2×", "Review"],
  ["Sarah Amalia", "@sarahcooks", "TikTok · Instagram", "74%", "—", "Unverified"],
];

export default function CreatorsPage() { return <div className="app-content"><header className="app-page-head"><div><span>Creator intelligence</span><h1>Creators</h1><p>Understand fit, evidence, history, and risk before you invite.</p></div><button className="button button-dark"><Plus weight="bold" /> Add creator</button></header><div className="page-tabs"><button className="active">All creators</button><button>Verified</button><button>Shortlisted</button><button>Needs review</button></div><section className="surface table-wrap"><table className="data-table"><thead><tr><th>Creator</th><th>Channels</th><th>Campaign fit</th><th>Historical ROAS</th><th>Verification</th></tr></thead><tbody>{creators.map(row => <tr key={row[0]}><td><strong>{row[0]}</strong><small>{row[1]}</small></td><td>{row[2]}</td><td><strong>{row[3]}</strong><small>For Ramadan Made Simple</small></td><td>{row[4]}</td><td><span className={`status-pill ${row[5] !== "Verified" ? "neutral" : ""}`}>{row[5] === "Verified" && <SealCheck weight="fill" />} {row[5]}</span></td></tr>)}</tbody></table></section></div>; }
