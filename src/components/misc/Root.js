import { Outlet } from 'react-router-dom';
import Navigationbar from '../nav/Navigationbar';

function RootLayout() {
  return (
    <>
      <Navigationbar/>
      <main>
        {/* {navigation.state === 'loading' && <p>Loading...</p>} */}
        <Outlet />
      </main>
    </>
  );
}

export default RootLayout;
