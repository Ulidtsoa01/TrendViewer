import { Link } from 'react-router-dom';
// import { stocklistActions } from '../../store/index';
// import { json } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { PortfolioMap } from '../../Constant';

function Navigationbar() {
  // const dispatch = useDispatch();
  // let accounts = useSelector((state) => state.accounts);

  // console.log('Navigationbar called.');
  // console.log(accounts);

  // const loadAccounts = async () => {
  //   const response = await fetch('/rest/account/only');
  //   // console.log('loadAccounts called...');

  //   if (!response.ok) {
  //     // return { isError: true, message: 'Could not fetch events.' };
  //     // throw new Response(JSON.stringify({ message: 'Could not fetch events.' }), {
  //     //   status: 500,
  //     // });
  //     throw json(
  //       { message: 'Could not fetch hot items.' },
  //       {
  //         status: 500,
  //       }
  //     );
  //   } else {
  //     const resData = await response.json();
  //     dispatch(stocklistActions.setAccounts(resData));
  //     //accounts = resData;
  //   }
  // };

  // useEffect(() => {
  //   if (!accounts) {
  //     loadAccounts();
  //   }
  // }, []);

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Trend
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/account">
              Account
            </Nav.Link>
            <Nav.Link as={Link} to="/holdings">
              Holdings
            </Nav.Link>
            <Nav.Link as={Link} to="/hot">
              Hot
            </Nav.Link>
            <NavDropdown title="Watch" id="watch">
              <NavDropdown.Item as={Link} to="/watch/core">
                {PortfolioMap['core']}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/watch/watch">
                {PortfolioMap['watch']}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/watch/rb">
                {PortfolioMap['rb']}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/watch/hy">
                {PortfolioMap['hy']}
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/watch/industry">
                Industry ETF
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/market">
              Market Journal
            </Nav.Link>
            <Nav.Link as={Link} to="/ticker">
              Ticker
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigationbar;
