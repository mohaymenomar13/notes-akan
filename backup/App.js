import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get('http://localhost/api.php')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        setError('Error fetching data');
        console.error(error);
      });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const params = new URLSearchParams();
        params.append('name', name);
        params.append('email', email);
        const response = await axios.post('http://localhost/api.php', params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
      setSuccess('Record created successfully');
      console.log(response.data);
      // Refresh data after successful submission
      axios.get('http://localhost/api.php')
        .then(response => {
          setData(response.data);
        })
        .catch(error => {
          setError('Error refreshing data');
          console.error(error);
        });
    } catch (error) {
      setError('Error creating record');
      console.error(error);
    }
  };

  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name} ({item.email})</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;