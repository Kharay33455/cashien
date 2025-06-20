import '../static/App.css';
import Index from "./Index";
import Rates from "./Rates";
import Login from "./Login";
import Register from "./Register";
import Activity from "./subs/Activity";
import Profile from "./Profile";
import Verification from "./Verification";
import Trade from "./Trade";
import MyAds from "./MyAds";
import Faq from "./Faq";
import Transaction from "./Transaction";
import ForgotPass from "./ForgotPass";
import { Routes, Route, Link, useNavigate } from "react-router";
import { useState, createContext, useRef, useEffect, useCallback } from "react";
import env from "react-dotenv";
import NewPassword from './NewPassword';
import Dispute from './Dispute';


export const GlobalContext = createContext(null);


function App() {
  const [user, SetUser] = useState(undefined);
  const [fetching, SetF] = useState(true);
  const closeBtn = useRef(null);
  const cusGold = "#F3C31C"
  const cusBlack = "#29303D"
  const cusGray = "rgb(200,200,200)";
  const BH = env.REACT_APP_ENV === "DEV" ? env.REACT_APP_BH_DEV : env.REACT_APP_BH_PROD;
  const WS = env.REACT_APP_ENV === "DEV" ? env.REACT_APP_WS_DEV : env.REACT_APP_WS_PROD;
  const appEnv = env.REACT_APP_ENV;
  const [sockets, SetSockets] = useState(false);
  const Translator = useRef(null);
  const navigate = useNavigate();

  // loyalty announcement
  const LoyaltyAnoucement = useCallback(async (server) => {
    const resp = await fetch(window.location.protocol + "//" + server + "/cashien/loyalty-check");
    if (resp.status) {

    }
  }, []);

  const PingSockets = useCallback(() => {
    (async function () {
      try {
        const server = WS.split("//")[1];
        const resp = await fetch(window.location.protocol + "//" + server);
        if (resp.status === 200) {
          const result = await resp.json();
          if (result['msg'] === "I am awake") {
            SetSockets(true);
            LoyaltyAnoucement(server);
          }
        }
      } catch (error) {
        console.log(error);
      }
    })();

  }, [WS, LoyaltyAnoucement]);


  const [cookie, SetCookie] = useState(document.cookie.split("token=")[document.cookie.split("token=").length - 1]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sockets) {
        PingSockets();
      } else {
        clearInterval(interval);
      }
    }, 600000);

    return () => {
      clearInterval(interval);
    }
  }, [sockets, PingSockets]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (sockets) {
        clearInterval(interval);
      } else {
        PingSockets();
      }
    }, 5000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    }
  }, [PingSockets, sockets]);

  const SignOut = async () => {
    if (fetching) {
      return;
    }
    SetF(true);
    const resp = await fetch(BH + "/cashien/logout",
      {
        method: "GET", headers: {
          "Content-Type": "application/json",
          "Authorization": cookie
        }
      }
    );
    if (resp.status === 200) {
      navigate("/");
      setTimeout(() => {
        SetCookie(undefined);
        SetUser(undefined);
        SetF(false);
        closeBtn.current.click()
      }, [1000]);
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






  // append translator
  useEffect(() => {

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en' },
        'google_translate_element'
      );
    };
    const TranslatorScript = document.createElement("script");
    TranslatorScript.type = "text/javascript";
    TranslatorScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(TranslatorScript);
  }, []);

  useEffect(() => {
    const clearHeadTimer = setInterval(() => {
      const head = document.getElementById(":1.container");
      if (head) {
        head.style.display = "none";
        clearInterval(clearHeadTimer);
      }
    }, 3000);
  }, []);


  return (
    <div>


      <GlobalContext.Provider value={{ 'user': user, 'SetUser': SetUser, "BH": BH, "WS": WS, 'cusGold': cusGold, "cookie": cookie, "SetCookie": SetCookie, "cusBlack": cusBlack, 'cusGray': cusGray, "fetching": fetching, "SetF": SetF, "appEnv": appEnv }}>
        <nav className="navbar navbar-dark bg-dark fixed-top">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/" style={{ fontWeight: "900" }}>CA$HI&euro;N</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
              <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasDarkNavbarLabel">CA$HI&euro;N</h5>
                <button ref={closeBtn} type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
              </div>
              <div className="offcanvas-body">
                <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                  <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" to="/" onClick={() => { closeBtn.current.click() }}>Home</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to={user ? "/rates" : "/login/rates"} onClick={() => { closeBtn.current.click() }}>Rates</Link>
                  </li>
                  <li className="nav-item dropdown">
                    <Link className="nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Core
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-dark">
                      <li><Link className="dropdown-item" to="/my-ads" onClick={() => { closeBtn.current.click() }}>My ADs</Link></li>
                      <li><Link className="dropdown-item" to="/profile" onClick={() => { closeBtn.current.click() }}>History</Link></li>
                      <li><Link className="dropdown-item" to="/transactions/" onClick={() => { closeBtn.current.click() }}>Transactions</Link></li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li><Link className="dropdown-item" to="/faq" onClick={() => { closeBtn.current.click() }}>FAQs</Link></li>
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
                                {user.user}
                              </span>
                            </Link>
                          </div>
                          <div className="Center Horizontally Vertically">
                            <button className="Link White btn btn-danger" to="/register/index" onClick={() => {
                              SignOut();
                            }}>
                              <span className=" White">
                                {
                                  fetching ? <Activity /> :
                                    "Logout"
                                }
                              </span>
                            </button>
                          </div>
                        </div>
                        :

                        fetching ?

                          <Activity />
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

        <div ref={Translator} style={{ position: "fixed", top: "70vh", zIndex: "3" }}>
          <div id="google_translate_element">

          </div>
        </div>

        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/login/:from" element={<Login />} />
          <Route path="/register/:from" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verification/*" element={<Verification />} />
          <Route path="/trade/:tradeId" element={<Trade />} />
          <Route path="/my-ads/*" element={<MyAds />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/transactions/*" element={<Transaction />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/reset-password/:otp" element={<NewPassword />} />
          <Route path="/dispute/:tradeId" element={<Dispute />} />
        </Routes>


      </GlobalContext.Provider>

    </div>

  );
}

export default App;
