import '../static/App.css';
import Index from "./Index";
import Rates from "./Rates";
import Login from "./Login";
import Register from "./Register";
import Activity from "./subs/Activity";
import Profile from "./Profile";
import Verification from "./Verification";
import { HashRouter, Routes, Route, Link } from "react-router";
import { useState, createContext, useRef, useEffect } from "react";
import env from "react-dotenv";


export const GlobalContext = createContext(null);


function App() {
  const [user, SetUser] = useState(undefined);
  const [fetching, SetF] = useState(true);
  const closeBtn = useRef(null);
  const cusGold = "#F3C31C"
  const cusBlack = "#29303D"
  const cusGray = "rgb(200,200,200)";
  const BH = env.REACT_APP_ENV === "DEV" ? env.REACT_APP_BH_DEV : env.REACT_APP_BH_PROD;
  const [cookie, SetCookie] = useState(document.cookie.split("token=")[document.cookie.split("token=").length - 1]);

  const SignOut = async () => {
    const resp = await fetch(BH + "/cashien/logout",
      {
        method: "GET", headers: {
          "Content-Type": "application/json",
          "Authorization": cookie
        }
      }
    );
    if (resp.status === 200) {
      SetUser(undefined);
    }
  }

  useEffect(() => {
    (async function () {
      const resp = await fetch(BH + "/cashien/fetch-user",
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            "Authorization": cookie
          }
        }
      );
      if (resp.status === 200) {
        const res = await resp.json();
        SetUser(res['cus']);
      }
      SetF(false);
    })();
  }, [BH, cookie]);


  return (
    <div>

      <GlobalContext.Provider value={{ 'user': user, 'SetUser': SetUser, "BH" : BH, 'cusGold' : cusGold, "cookie":cookie,"SetCookie":SetCookie, "cusBlack" : cusBlack, 'cusGray':cusGray, "fetching" : fetching }}>
        <HashRouter>
          <nav className="navbar navbar-dark bg-dark fixed-top">
            <div className="container-fluid">
              <Link className="navbar-brand" to="/">Logo</Link>
              <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
                <div className="offcanvas-header">
                  <h5 className="offcanvas-title" id="offcanvasDarkNavbarLabel">Logo</h5>
                  <button ref={closeBtn} type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                  <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                    <li className="nav-item">
                      <Link className="nav-link active" aria-current="page" to="/" onClick={() => { closeBtn.current.click() }}>Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link"  to={user ? "/rates" : "/login/rates"}  onClick={() => { closeBtn.current.click() }}>Rates</Link>
                    </li>
                    <li className="nav-item dropdown">
                      <Link className="nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Core
                      </Link>
                      <ul className="dropdown-menu dropdown-menu-dark">
                        <li><Link className="dropdown-item" to="#" onClick={() => { closeBtn.current.click() }}>Start Selling</Link></li>
                        <li><Link className="dropdown-item" to="#" onClick={() => { closeBtn.current.click() }}>History</Link></li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li><Link className="dropdown-item" to="#" onClick={() => { closeBtn.current.click() }}>FAQs</Link></li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      {
                        user ?
                          <div className="SideBySide" style={{ marginTop: "5%" }}>
                            <div className="Center Horizontally Vertically">
                              <Link className="Link White" to="/profile" onClick={() => { 
                                closeBtn.current.click();
                                }}>
                                <span className="btn btn-success">
                                  Profile
                                </span>
                              </Link>
                            </div>
                            <div className="Center Horizontally Vertically">
                              <button className="Link White btn btn-danger" to="/register/index" onClick={() => {
                                SignOut();
                              }}>
                                <span className=" White">
                                  Logout
                                </span>
                              </button>
                            </div>
                          </div>
                          :

                          fetching ?
                          
                          <Activity/>
                          :

                          <div className="SideBySide" style={{ marginTop: "5%" }}>
                            <div className="Center Horizontally Vertically">
                              <Link className="Link White" to="/login/index" onClick={() => { closeBtn.current.click() }}>
                                <span className="btn btn-success">
                                  Login
                                </span>
                              </Link>
                            </div>
                            <div className="Center Horizontally Vertically">
                              <Link className="Link White" to="/register/index" onClick={() => { closeBtn.current.click() }}>
                                <span className="btn btn-info White">
                                  Register
                                </span>
                              </Link>
                            </div>
                          </div>
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/rates" element={<Rates />} />
            <Route path="/login/:from" element={<Login />} />
            <Route path="/register/:from" element={<Register />} />
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/verification/*" element = {<Verification/>}/>

          </Routes>
        </HashRouter>

      </GlobalContext.Provider>
    </div>

  );
}

export default App;
