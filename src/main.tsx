import { render } from 'solid-js/web';
import { App } from './ui/App.tsx';
import '@fontsource-variable/eb-garamond';
import './ui/style.css';

render(() => <App />, document.getElementById('app')!);
