import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminView() {
    const [tickets, setTickets] = useState([]);
    const [replyText, setReplyText] = useState("");

    const loadTickets = () => {
        axios.get('http://localhost:8080/api/tickets/all').then(res => setTickets(res.data));
    };

    useEffect(() => { loadTickets(); }, []);

    const handleReply = (id) => {
        axios.put(`http://localhost:8080/api/tickets/reply/${id}`, replyText, {
            headers: { 'Content-Type': 'text/plain' }
        }).then(() => {
            alert("Reply sent");
            loadTickets();
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Admin Dashboard</h2>
            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>ID</th><th>Subject</th><th>Message</th><th>Date</th><th>Attachment</th><th>Reply</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(t => (
                        <tr key={t.id}>
                            <td>{t.id}</td>
                            <td>{t.subject}</td>
                            <td>{t.message}</td>
                            <td>{new Date(t.receivedDate).toLocaleString()}</td>
                            <td>
                                {t.attachmentName ? 
                                    <a href={`http://localhost:8080/api/tickets/download/${t.id}`}>Download</a> 
                                    : "No File"}
                            </td>
                            <td>
                                {t.adminReply ? t.adminReply : 
                                    <div>
                                        <input onChange={e => setReplyText(e.target.value)} />
                                        <button onClick={() => handleReply(t.id)}>Send</button>
                                    </div>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}