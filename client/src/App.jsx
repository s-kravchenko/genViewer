import { useEffect, useState } from 'react';

function App() {
  const users = [
    { name: 'John', age: 30 },
    { name: 'Mary', age: 28 },
  ];

  return (
    <div>
      {users.map((user, i) =>
            <p key={i}>{user.name}: {user.age} years old</p>
      )}
    </div>
  );
}

export default App;
