import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './Home';
import '../../assets/styles/tailwind.css';

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find root element");
  const root = createRoot(rootContainer);
  root.render(<Home />);
}

init();
