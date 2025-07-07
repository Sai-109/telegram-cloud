import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  return React.createElement('div', null, 'Hello, Telegram Cloud!');
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));