import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar";
import { AuthContext } from "../../context/AuthContext";
import "./StudentView.css";

const ticketsApi = axios.create({
  baseURL: "http://localhost:8081/api/tickets",
  withCredentials: true,
});

export default function StudentView() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({
    resourceLocation: "",
    category: "Hardware",
    priority: "LOW",
    description: "",
    contactDetails: "",
  });
  const [files, setFiles] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});

  const loadTickets = useCallback(async () => {
    setLoadError("");
    try {
      const res = await ticketsApi.get("");
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      const msg =
        e.response?.status === 401
          ? "Session expired — please log in again."
          : "Could not load tickets.";
      setLoadError(msg);
      setTickets([]);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const submit = async () => {
    // Validation for description length
    if (form.description.length > 500) {
      alert("Description cannot exceed 500 characters.");
      return;
    }

    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    Array.from(files)
      .slice(0, 3)
      .forEach((file) => data.append("files", file));

    try {
      await ticketsApi.post("/submit", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Ticket submitted successfully!");
      setForm((f) => ({
        ...f,
        resourceLocation: "",
        description: "",
        contactDetails: "",
      }));
      setFiles([]);
      loadTickets();
    } catch (error) {
      alert(
        error.response?.data ||
          error.response?.statusText ||
          "Ticket NOT submitted!"
      );
    }
  };

  const submitReply = async (ticketId) => {
    const message = (replyDrafts[ticketId] || "").trim();
    if (!message) return;
    try {
      await ticketsApi.post(`/${ticketId}/replies`, { message });
      setReplyDrafts((prev) => ({ ...prev, [ticketId]: "" }));
      loadTickets();
    } catch (error) {
      alert(error.response?.data || "Reply failed");
    }
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="tickets-page">
      <Navbar />
      <div className="tickets-inner">
        <h1>Incidents</h1>
        <p className="tickets-sub">
          {isAdmin
            ? "All tickets raised by users (newest first)."
            : "Your raised tickets (newest first)."}
        </p>

        {loadError && <div className="tickets-banner-error">{loadError}</div>}

        <section className="tickets-card">
          <h2>Ticket list</h2>
          <div className="tickets-table-wrap">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  {isAdmin && <th>Raised by</th>}
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="tickets-empty">
                      No tickets yet.
                    </td>
                  </tr>
                )}
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>#{t.id}</td>
                    <td>{t.resourceLocation}</td>
                    <td>{t.category}</td>
                    <td>{t.description || "—"}</td>
                    <td>{t.priority}</td>
                    <td>{String(t.status || "").replace("_", " ")}</td>
                    {isAdmin && <td>{t.createdBy || "—"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {!isAdmin && (
          <section className="tickets-card tickets-form-card">
            <h2>Raise a ticket</h2>
            <div className="tickets-form">
              <label>Resource location</label>
              <input
                placeholder="e.g. Lab 3 — projector"
                value={form.resourceLocation}
                onChange={(e) =>
                  setForm({ ...form, resourceLocation: e.target.value })
                }
              />

              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>

              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              <label>Description ({form.description.length}/500)</label>
              <textarea
                placeholder="What is the issue?"
                value={form.description}
                maxLength={500}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <label>Contact details</label>
              <input
                placeholder="Phone or email"
                value={form.contactDetails}
                onChange={(e) =>
                  setForm({ ...form, contactDetails: e.target.value })
                }
              />

              <label>Evidence (max 3 images)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(e.target.files)}
              />

              <button type="button" className="tickets-submit" onClick={submit}>
                Submit ticket
              </button>
            </div>
          </section>
        )}

        <section className="tickets-card">
          <h2>Ticket conversations</h2>
          {tickets.length === 0 && (
            <p className="tickets-empty">No conversations yet.</p>
          )}
          {tickets.map((t) => (
            <div className="ticket-thread" key={`thread-${t.id}`}>
              <div className="ticket-thread-head">
                <strong>Ticket #{t.id}</strong> - {t.resourceLocation}
              </div>
              <div className="ticket-thread-body">
                <span className="ticket-reply-meta">
                  {t.createdBy || "user"} - original message
                </span>
                <div>{t.description || "No description."}</div>
              </div>
              <div className="ticket-thread-replies">
                {Array.isArray(t.replies) && t.replies.length > 0 ? (
                  t.replies.map((r, idx) => (
                    <div className="ticket-reply" key={`${t.id}-r-${idx}`}>
                      <span className="ticket-reply-meta">
                        {r.authorEmail || "admin"}{" "}
                        {r.createdAt
                          ? `- ${new Date(r.createdAt).toLocaleString()}`
                          : ""}
                      </span>
                      <div>{r.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="tickets-empty">No replies yet.</div>
                )}
              </div>
              {isAdmin && (
                <div className="ticket-reply-box">
                  <textarea
                    placeholder="Reply to this ticket..."
                    value={replyDrafts[t.id] || ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [t.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="tickets-submit"
                    onClick={() => submitReply(t.id)}
                  >
                    Send reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}