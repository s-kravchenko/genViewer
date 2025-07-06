export type User = {
  name: String;
  age: number;
};

function App() {
  const users: User[] = [
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
