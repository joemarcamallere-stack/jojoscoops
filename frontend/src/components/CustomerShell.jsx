import { Outlet } from 'react-router-dom';
import Header from './Header';
import '../styles/Jojos.com.css';
import '../styles/brand.css';
import '../styles/site-common.css';
import '../styles/cream.css';
import '../styles/about_us.css';

export default function CustomerShell() {
  return (
    <div className="app-container">
      <Header />
      <Outlet />
    </div>
  );
}
