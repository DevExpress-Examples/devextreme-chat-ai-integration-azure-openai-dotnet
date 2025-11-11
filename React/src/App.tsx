import ChatApp from './components/ChatApp.tsx';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';

function App(): JSX.Element {
  return (
    <div className="main">
      <ChatApp />
    </div>
  );
}

export default App;
