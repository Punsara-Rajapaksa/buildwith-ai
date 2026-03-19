function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, background: '#f3f4f6', padding: '1rem' }}>
        Preview area will go here
      </div>
      <div style={{ borderTop: '1px solid #ccc', padding: '1rem', background: 'white' }}>
        <input
          type="text"
          placeholder="Describe the webpage you want..."
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
        />
      </div>
    </div>
  );
}

export default App;