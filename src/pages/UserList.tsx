import React, { useEffect, useState } from "react";
import { getAllUsers } from "../services/api";
import { User } from "../types";
import "./styles/UserList.css";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data.users);
      } catch (err: any) {
        let msg = "Misslyckades med att hämta användare";
        if (err.response && err.response.data && err.response.data.error) {
          msg = err.response.data.error;
        }
        setError(msg);
        // För felsökning i webbläsarens konsol
        console.error("Fel vid hämtning av användare:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loaderar...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="user-list-page">
      <h2>Användarlista</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Användarnamn</th>
            <th>Roll</th>
            <th>Skapad</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleString("sv-SE")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;