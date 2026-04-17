import React, { useState } from 'react';
import axios from 'axios';
import './StudentView.css';

export default function StudentView() {

   const [form, setForm] = useState({
    resourceLocation: '',
    category: 'Hardware',
    priority: 'LOW',
    description: '',
    contactDetails: ''
});

    const [files, setFiles] = useState([]);

    const submit = async () => {
        const data = new FormData();

        Object.keys(form).forEach(key => data.append(key, form[key]));

        Array.from(files).slice(0, 3).forEach(file =>
            data.append('files', file)
        );

        try {
            const res = await axios.post(
                'http://localhost:8081/api/tickets/submit',
                data
            );

            alert("Ticket submitted successfully!");
            console.log(res.data);

        } catch (error) {
            alert("Ticket NOT submitted!");
            console.log(error);
        }
    };
    

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            <h2>Create Maintenance Ticket</h2>

            <input
                placeholder="Resource Location"
                onChange={e => setForm({ ...form, resourceLocation: e.target.value })}
            />

            <select onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Infrastructure">Infrastructure</option>
            </select>

            <select onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
            </select>

            <textarea
                placeholder="Description"
                onChange={e => setForm({ ...form, description: e.target.value })}
            />

            <input
                placeholder="Contact Details"
                onChange={e => setForm({ ...form, contactDetails: e.target.value })}
            />

            <input
                type="file"
                multiple
                onChange={e => setFiles(e.target.files)}
            />

            <small>Max 3 images</small>

            <button onClick={submit} style={{ background: 'blue', color: 'white' }}>
                Submit Ticket
            </button>
        </div>
    );
}