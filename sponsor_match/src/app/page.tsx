import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

library.add(faCheck);
library.add(faTwitter);

interface User {
  id: number;
  name: string;
  email: string;
}

export default async function Home() {
  let users: User[] = [];
  try {
    const res = await fetch('http://localhost:3000/api/users', {
      cache: 'no-store',
    });
    const json = await res.json();
    users = json.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }

  return (
    <div>
      {/* Delete later: */}
      <h1>User List</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: User) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}