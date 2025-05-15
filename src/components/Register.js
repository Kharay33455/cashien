import { Link, useParams, useNavigate } from "react-router";
import env from "react-dotenv";
import { DisplayMessage } from "./AuxFuncs";
import { GlobalContext } from "./App";
import { useContext, useState } from "react";
import Activity from "./subs/Activity";

const Register = () => {
    const params = useParams();
    const globalData = useContext(GlobalContext);
    const navigate = useNavigate();
    const [sending, SetS] = useState(false);

    const submitForm = async () => {
        const acceptables = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '!', '@', '#', '$', '%', '*', '_', '+', '=', '-', '.', ',', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm']
        const username = document.getElementById("username");
        const email = document.getElementById("email");
        const password1 = document.getElementById("password1");
        const password2 = document.getElementById("password2");
        const terms = document.getElementById("terms");

        Array.from(username.value.trim()).forEach((item) => {
            if (!acceptables.includes(item)) {
                DisplayMessage("Invalid characters present in username.", "red");
                return;
            }
        });

        if (username.value.trim().length < 1) {
            DisplayMessage("Username cannot be blank.", "red");
            return;
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        if (!isValidEmail(email.value)) {
            DisplayMessage("Invalid email format.", "red");
            return;
        }

        if (password1.value.trim().length < 8) {
            DisplayMessage("Password must be at least 8 characters long.", "red");
            return;
        }
        if (password1.value.trim() !== password2.value.trim()) {
            DisplayMessage("Password do not match", "red");
            return;
        }

        if (!terms.checked) {
            DisplayMessage("Agree to terms to continue.", "red");
            return;
        }

        SetS(true);

        const resp = await fetch((env.REACT_APP_ENV === "DEV" ? env.REACT_APP_BH_DEV : env.REACT_APP_BH_PROD) + "/cashien/register/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 'username': username.value.trim(), 'password1': password1.value.trim(), 'password2': password2.value.trim(), 'email': email.value.trim(), 'terms': terms.checked })
            });
        const res = await resp.json();
        if (resp.status === 200) {
            globalData.SetUser(res['cus']);
            document.cookie = "token=" + res['key'] + "; path=/; expires=Fri, 31 Dec 2025 23:59:59 GMT";
            params.from === "index" ? navigate("/") : navigate("/" + params.from);
        }
        else if (resp.status === 403) {
            DisplayMessage(res['msg'], "red");
        }
        else {
            DisplayMessage("An unexpected error has occured", "red");
        }
        SetS(false);
    }

    return (
        <div className="BodyWrapperTwo">
            <h1>
                Sign up to&nbsp;<span>{env.REACT_APP_COMPNAME}</span>
            </h1>
            <br />
            <div className="Center Horizontally">
                <div className="FormWrapper Center Vertically">

                    <form>
                        <div class="input-group flex-nowrap">
                            <span class="input-group-text" id="addon-wrapping">@</span>
                            <input type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="addon-wrapping" id="username" />
                        </div>
                        <br />
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Email address</label>
                            <input type="email" class="form-control" aria-describedby="emailHelp" id="email" />
                            <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputPassword1" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password1" />
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputPassword1" class="form-label">Password confirmation</label>
                            <input type="password" class="form-control" id="password2" />
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="terms" />
                            <label class="form-check-label" for="exampleCheck1">Agree to our terms and conditions</label>
                        </div>

                        <button type="submit" class="btn btn-primary" onClick={(event) => {
                            event.preventDefault();
                            !sending && submitForm()
                        }}>
                            {
                                sending
                                    ?
                                    <div style={{ minWidth: "76px" }}>

                                        <Activity />
                                    </div>
                                    :
                                    "Register"
                            }

                        </button>
                    </form>
                    <hr />
                    <div>
                        <small>
                            Already have an account?&nbsp;
                            <Link to={"/login/" + params['from']}>
                                Sign in instead.
                            </Link>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register;