import { Link, useParams, useNavigate } from "react-router";
import env from "react-dotenv";
import { DisplayMessage } from "./AuxFuncs";
import { GlobalContext } from "./App";
import { useContext, useState } from "react";
import Activity from "./subs/Activity";

const Login = () => {
    const params = useParams();
    const globalData = useContext(GlobalContext);
    const [sending, SetS] = useState(false);
    const navigate = useNavigate();

    const SubmitLoginForm = async () => {
        
        const username = document.getElementById("useroremail").value.trim()
        const password = document.getElementById("password").value.trim();
        
        
        SetS(true);
        const resp = await fetch(globalData.BH + "/cashien/login/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "username": username, "password": password })
            }
        );
        const res = await resp.json();
        if (resp.status === 200) {
            globalData.SetUser(res['cus']);
            if (globalData.appEnv === "PROD") {
                document.cookie = "token=" + res['key'] + "; path=/; expires=Fri, 31 Dec 2025 23:59:59 GMT; SameSite=None; Secure";
            } else {
                document.cookie = "token=" + res['key'] + "; path=/; expires=Fri, 31 Dec 2025 23:59:59 GMT";
            }
            globalData.SetCookie(res['key'])
            params.from === "index" ? navigate("/") : navigate("/" + params.from);
        }
        else if (resp.status === 403) {
            DisplayMessage(res['msg'], "red");
        }
        else {
            DisplayMessage("An unexpected error has occured", "red");
        }
        SetS(false);
    };
    return (
        <div className="BodyWrapperTwo">
            <h1>
                Sign in to&nbsp;<span>{env.REACT_APP_COMPNAME}</span>
            </h1>
            <br />
            <div className="Center Horizontally">
                <div className="FormWrapper">

                    <form>
                        <div class="mb-3">
                            <label for="useroremail" class="form-label">Username or Email</label>
                            <input type="text" class="form-control" id="useroremail" aria-describedby="userOrEmail" />

                        </div>
                        <div class="mb-3">
                            <label for="exampleInputPassword1" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" />
                        </div>


                        <button type="submit" class="btn btn-primary" onClick={(event) => {
                            event.preventDefault();
                            !sending && SubmitLoginForm();
                        }}>
                            {
                                sending
                                    ?
                                    <div style={{ minWidth: "49px" }}>
                                        <Activity />
                                    </div>
                                    :
                                    "Sign in"
                            }
                        </button>
                    </form>
                    <hr />
                    <div>
                        <small>
                            Don't have an account?&nbsp;
                            <Link to={"/register/" + params['from']}>
                                Register.
                            </Link>
                        </small>
                        <br />
                        <small>
                            <Link to="/forgot-password">
                                Forgot password?
                            </Link>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;