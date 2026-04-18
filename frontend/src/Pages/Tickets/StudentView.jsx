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
  const [commentsByTicket, setCommentsByTicket] = useState({});
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({
    resourceLocation: "",
    category: "Hardware",
    priority: "LOW",
    description: "",
    contactDetails: "",
  });
  const [files, setFiles] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [editDrafts, setEditDrafts] = useState({});
  const [assignDrafts, setAssignDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});
  const [resolutionDrafts, setResolutionDrafts] = useState({});

  const loadTickets = useCallback(async () => {
    setLoadError("");
    try {
      const res = await ticketsApi.get("");
      const list = Array.isArray(res.data) ? res.data : [];
      setTickets(list);

      const commentEntries = await Promise.all(
        list.map(async (t) => {
          try {
            const c = await ticketsApi.get(`/${t.id}/comments`);
            return [t.id, Array.isArray(c.data) ? c.data : []];
          } catch {
            return [t.id, []];
          }
        })
      );
      setCommentsByTicket(Object.fromEntries(commentEntries));
    } catch (e) {
      const msg =
        e.response?.status === 401
          ? "Session expired — please log in again."
          : "Could not load tickets.";
      setLoadError(msg);
      setTickets([]);
      setCommentsByTicket({});
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const submit = async () => {
    // Validation: Check if all text fields are filled
    if (
      !form.resourceLocation.trim() ||
      !form.description.trim() ||
      !form.contactDetails.trim()
    ) {
      alert("Please fill in all columns before submitting.");
      return;
    }

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

  const addComment = async (ticketId) => {
    const message = (commentDrafts[ticketId] || "").trim();
    if (!message) return;
    try {
      await ticketsApi.post(`/${ticketId}/comments`, { message });
      setCommentDrafts((prev) => ({ ...prev, [ticketId]: "" }));
      loadTickets();
    } catch (error) {
      alert(error.response?.data || "Comment failed");
    }
  };

  const updateComment = async (ticketId, commentId) => {
    const message = (editDrafts[commentId] || "").trim();
    if (!message) return;
    try {
      await ticketsApi.put(`/${ticketId}/comments/${commentId}`, { message });
      setEditDrafts((prev) => {
        const next = { ...prev };
        delete next[commentId];
        return next;
      });
      loadTickets();
    } catch (error) {
      alert(error.response?.data || "Update failed");
    }
  };

  const deleteComment = async (ticketId, commentId) => {
    try {
      await ticketsApi.delete(`/${ticketId}/comments/${commentId}`);
      loadTickets();
    } catch (error) {
      alert(error.response?.data || "Delete failed");
    }
  };

  const assignTechnician = async (ticketId) => {
    const technicianEmail = (assignDrafts[ticketId] || "").trim();
    if (!technicianEmail) return;
    try {
      await ticketsApi.put(`/${ticketId}/assign`, null, {
        params: { technicianEmail },
      });
      setAssignDrafts((prev) => ({ ...prev, [ticketId]: "" }));
      loadTickets();
    } catch (error) {
      alert(error.response?.data || "Assign failed");
    }
  };

  const updateStatus = async (ticketId) => {
    const status = statusDrafts[ticketId];
    if (!status) return;
    try {
      await ticketsApi.put(`/${ticketId}/status`, null, {
        params: {
          status,
          resolution: resolutionDrafts[ticketId] || undefined,
        },
      });
      setResolutionDrafts((prev) => ({ ...prev, [ticketId]: "" }));
      loadTickets();
    } catch (error) {
      alert(error.response?.data || "Status update failed");
    }
  };

  const isAdmin = user?.role === "ADMIN";
  const isTechnician = user?.role === "TECHNICIAN";
  const isStaff = isAdmin || isTechnician;

  return (
    <div className="tickets-page">
      <Navbar />
      <div className="tickets-inner">
        <h1>Incidents</h1>
        <p className="tickets-sub">
          {isAdmin
            ? "Admin: assign technicians, update status, and manage comments."
            : isTechnician
            ? "Technician: work on assigned tickets and add updates."
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
                  <th>Assigned</th>
                  {isAdmin && <th>Raised by</th>}
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="tickets-empty">
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
                    <td>{t.assignedTo || "—"}</td>
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
          <h2>Ticket comments & workflow</h2>
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
                {Array.isArray(commentsByTicket[t.id]) &&
                commentsByTicket[t.id].length > 0 ? (
                  commentsByTicket[t.id].map((r) => (
                    <div className="ticket-reply" key={`${t.id}-c-${r.id}`}>
                      <span className="ticket-reply-meta">
                        {r.commenterEmail || "unknown"}{" "}
                        {r.createdAt
                          ? `- ${new Date(r.createdAt).toLocaleString()}`
                          : ""}
                      </span>
                      {editDrafts[r.id] !== undefined ? (
                        <>
                          <textarea
                            value={editDrafts[r.id]}
                            onChange={(e) =>
                              setEditDrafts((prev) => ({
                                ...prev,
                                [r.id]: e.target.value,
                              }))
                            }
                          />
                          <div className="ticket-comment-actions">
                            <button
                              type="button"
                              className="tickets-submit"
                              onClick={() => updateComment(t.id, r.id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="tickets-submit tickets-btn-light"
                              onClick={() =>
                                setEditDrafts((prev) => {
                                  const next = { ...prev };
                                  delete next[r.id];
                                  return next;
                                })
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>{r.message}</div>
                          <div className="ticket-comment-actions">
                            {user?.email === r.commenterEmail && (
                              <button
                                type="button"
                                className="tickets-submit tickets-btn-light"
                                onClick={() =>
                                  setEditDrafts((prev) => ({
                                    ...prev,
                                    [r.id]: r.message,
                                  }))
                                }
                              >
                                Edit
                              </button>
                            )}
                            {(user?.email === r.commenterEmail || isAdmin) && (
                              <button
                                type="button"
                                className="tickets-submit tickets-btn-danger"
                                onClick={() => deleteComment(t.id, r.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="tickets-empty">No comments yet.</div>
                )}
              </div>

              {isAdmin && (
                <div className="ticket-staff-box">
                  <label>Assign technician (email)</label>
                  <input
                    placeholder="tech@email.com"
                    value={assignDrafts[t.id] || ""}
                    onChange={(e) =>
                      setAssignDrafts((prev) => ({
                        ...prev,
                        [t.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="tickets-submit"
                    onClick={() => assignTechnician(t.id)}
                  >
                    Assign technician
                  </button>
                </div>
              )}

              {isStaff && (
                <div className="ticket-staff-box">
                  <label>Update status</label>
                  <select
                    value={statusDrafts[t.id] || ""}
                    onChange={(e) =>
                      setStatusDrafts((prev) => ({
                        ...prev,
                        [t.id]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select status</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                  <input
                    placeholder="Resolution notes (optional)"
                    value={resolutionDrafts[t.id] || ""}
                    onChange={(e) =>
                      setResolutionDrafts((prev) => ({
                        ...prev,
                        [t.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="tickets-submit"
                    onClick={() => updateStatus(t.id)}
                  >
                    Update status
                  </button>
                </div>
              )}

              <div className="ticket-reply-box">
                <textarea
                  placeholder="Add comment..."
                  value={commentDrafts[t.id] || ""}
                  onChange={(e) =>
                    setCommentDrafts((prev) => ({
                      ...prev,
                      [t.id]: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  className="tickets-submit"
                  onClick={() => addComment(t.id)}
                >
                  Add comment
                </button>
              </div>

              {isAdmin && (
                <div className="ticket-reply-box">
                  <textarea
                    placeholder="Legacy reply endpoint (optional)"
                    value={commentDrafts[`legacy-${t.id}`] || ""}
                    onChange={(e) =>
                      setCommentDrafts((prev) => ({
                        ...prev,
                        [`legacy-${t.id}`]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="tickets-submit"
                    onClick={async () => {
                      const msg = (commentDrafts[`legacy-${t.id}`] || "").trim();
                      if (!msg) return;
                      try {
                        await ticketsApi.post(`/${t.id}/replies`, { message: msg });
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [`legacy-${t.id}`]: "",
                        }));
                        loadTickets();
                      } catch (error) {
                        alert(error.response?.data || "Legacy reply failed");
                      }
                    }}
                  >
                    Send legacy reply
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