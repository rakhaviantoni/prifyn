import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";

const campaigns = [
  ["Ramadan Made Simple", "Active", "8 creators", "Rp 28.4m", "4.1×", "16 Aug 2026"],
  ["Weekend Family Feast", "At risk", "5 creators", "Rp 12.8m", "2.7×", "9 Aug 2026"],
  ["Lunch Box Launch", "Active", "12 creators", "Rp 36.2m", "3.2×", "28 Aug 2026"],
  ["Back to School", "Draft", "0 creators", "Rp 18.0m", "—", "3 Sep 2026"],
];

export default function CampaignsPage() { return <div className="app-content"><header className="app-page-head"><div><span>Campaign operations</span><h1>Campaigns</h1><p>Plan, execute, and close the loop on every growth initiative.</p></div><Link className="button button-dark" href="/app/campaigns?new=true"><Plus weight="bold" /> New campaign</Link></header><div className="page-tabs"><button className="active">All campaigns</button><button>Active</button><button>Needs attention</button><button>Completed</button></div><section className="surface table-wrap"><table className="data-table"><thead><tr><th>Campaign</th><th>Status</th><th>Creators</th><th>Attributed revenue</th><th>ROAS</th><th>End date</th></tr></thead><tbody>{campaigns.map(row => <tr key={row[0]}><td><strong>{row[0]}</strong><small>Creator-led growth campaign</small></td><td><span className={`status-pill ${row[1] === "At risk" ? "warning" : row[1] === "Draft" ? "neutral" : ""}`}>{row[1]}</span></td>{row.slice(2).map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody></table></section></div>; }
