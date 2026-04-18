import React, { useState } from 'react';
import axios from 'axios';

export default function StudentView() {
    const [form, setForm] = useState({ subject: '', message: '' });
    const [file, setFile] = useState(null);

    const submit = async () => {
        const data = new FormData();
        data.append('subject', form.subject);
        data.append('message', form.message);
        if (file) data.append('file', file);

        await axios.post('http://localhost:8080/api/tickets/submit', data);
        alert("Ticket Submitted Successfully");
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Submit a Ticket</h2>
            <input placeholder="Subject" onChange={e => setForm({...form, subject: e.target.value})} /><br/>
            <textarea 
                maxLength="1000" 
                placeholder="Message (max 1000 chars)" 
                onChange={e => setForm({...form, message: e.target.value})} 
            /><br/>
            <input type="file" onChange={e => setFile(e.target.files[0])} /><br/>
            <button onClick={submit}>Send Ticket</button>
        </div>
    );
}