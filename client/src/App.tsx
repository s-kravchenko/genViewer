import { useEffect, useState } from 'react';
import { User } from '@shared/types/user';

function App() {
  const [backendData, setBackendData] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then((response) => response.json())
      .then((data) => setBackendData(data));
  }, []);

  return (
    <div>
      {
        typeof backendData === 'undefined'
          ? 'Loading...'
          : backendData.map((user, i) => (
              <p key={i}>
                {user.name}: {user.age} years old
              </p>
            ))
      }
    </div>
  );
}

export default App;
