import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminView() {
    const [tickets, setTickets] = useState([]);

    const loadTickets = () => {
        axios.get('http://localhost:8080/api/tickets/all').then(res => setTickets(res.data));
    };

    const updateStatus = (id, status) => {
        const note = prompt("Enter resolution/rejection note:");
        axios.put(`http://localhost:8080/api/tickets/${id}/status?status=${status}&note=${note}`)
             .then(() => loadTickets());
    };

    useEffect(() => { loadTickets(); }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Staff/Admin Maintenance Dashboard</h2>
            <table border="1" width="100%" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#eee' }}>
                        <th>ID</th><th>Details</th><th>Priority</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(t => (
                        <tr key={t.id}>
                            <td>{t.id}</td>
                            <td>
                                <b>{t.subject}</b> ({t.category})<br/>
                                <small>{t.message}</small>
                            </td>
                            <td style={{ color: t.priority === 'HIGH' ? 'red' : 'black' }}>{t.priority}</td>
                            <td><b>{t.status}</b></td>
                            <td>
                                <button onClick={() => updateStatus(t.id, 'IN_PROGRESS')}>In Progress</button>
                                <button onClick={() => updateStatus(t.id, 'RESOLVED')}>Resolve</button>
                                <button onClick={() => updateStatus(t.id, 'REJECTED')} style={{color: 'red'}}>Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}