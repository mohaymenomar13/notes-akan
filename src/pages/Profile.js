import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function Profile() {
    const userSession = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user_session=')).replace('user_session=', '');
    const [data, setData] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { user_id } = useParams();
    const navigate = useNavigate();

    const [edit, setEdit] = useState(false);
    const [passDia, setPassDia] = useState(false);
    const [notifPass, setNotifPass] = useState(false);

    const editDiaOpen = () => {
        fetchUser();
        setEdit(true);
    }

    const editDiaClose = () => {
        setEdit(false);
    }

    const passDiaClose = () => {
        setPassDia(false);
    }

    const notifPassClose = () => {
        setNotifPass(false);
    }

    useEffect(() => {
        console.log("useeffects")
        fetchUser();
    },[])

    const fetchUser = async () => {
        try {
            const params = new URLSearchParams();
            params.append("user_id", user_id);
            const response = await axios.get('http://localhost/api/profile.php', { params });
            setData(response.data);
            setEmail(response.data.email);
            setName(response.data.name);
            setPassword(response.data.password);
        } catch (err) {
            console.log(err);
        }
    }

    const updateNameEmail = async () => {
        try {
            const params = new URLSearchParams();
            params.append("user_id", user_id);
            params.append("name", name);
            params.append("email", email);
            const response = await axios.put('http://localhost/api/profile.php', null, { params });
            editDiaClose();
            fetchUser();
        } catch (err) {
            console.error(err);
        }
    }

    const changePassword = async () => {
        if (currentPassword === password && newPassword === confirmPassword) {
            try {
                const params = new URLSearchParams();
                params.append("user_id", user_id);
                params.append("newPassword", newPassword);
                params.append("currentPassword", password);
                await axios.put('http://localhost/api/changepass.php', null, { params });
                fetchUser();
                setNotifPass(true);
            } catch (err) {
                console.error(err);
            }
        } else {
            setPassDia(true);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    const handleLogout = () => {
        document.cookie = "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/signin');
    };

    return (
        <div>
            <h1>Profile Page</h1> <button onClick={() => navigate('/')}>Home</button>
            <p>{data.name}</p>
            <p>{data.email}</p>
            <button onClick={editDiaOpen}>Edit</button>
            <p>{data.time_created}</p>
            {userSession == user_id && (
            <div>
            <h2>Account Settings</h2>
            <label>
                Current Password:
                <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" />
            </label><br/>
            <label>
                New Password:
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" />
            </label><br/>
            <label>
                Confirm Password:
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
            </label><br/>
            <button onClick={changePassword}>Save Changes</button><br/>
            </div>
            )}

            <button onClick={handleLogout}>Logout</button>

            <Dialog open={edit} onClose={editDiaClose}>
                <DialogTitle id="edit-dialog-title">Edit Profile</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Edit your profile information here.
                    </DialogContentText>
                    <form>
                        <label>
                            Name:
                            <input type="text" onChange={(e) => setName(e.target.value)} placeholder={data.name} />
                        </label>
                        <label>
                            Email:
                            <input type="text" onChange={(e) => setEmail(e.target.value)} placeholder={data.email}/>
                        </label>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={editDiaClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={updateNameEmail} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={passDia} onClose={passDiaClose}>
                <DialogTitle id="pass-dialog-title">Password Change Failed</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Current password does not match or new passwords do not match. Please try again.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={passDiaClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={notifPass} onClose={notifPassClose}>
                <DialogTitle id="notif-dialog-title">Password Change Successful</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Password has been successfully changed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={notifPassClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}