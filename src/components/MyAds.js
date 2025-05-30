import { FaTrashAlt } from "react-icons/fa";
import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "./App";
import { Routes, Route, Link, useNavigate } from "react-router";
import Activity from "./subs/Activity";
import { DisplayMessage, addComma, formatNumber } from "./AuxFuncs";


const MyAds = () => {
    const globalData = useContext(GlobalContext);
    const [Ads, SetAds] = useState(null);
    const navigate = useNavigate();
    const [IsActive, SetIsActive] = useState(null);
    const [loader, SetLoader] = useState("0%");
    const [loaderHeight, SetLoaderHeight] = useState("0vh");



    // Return functions

    const CheckField = () => {
        const min = formatNumber(document.getElementById("min").value);
        const max = formatNumber(document.getElementById("max").value);
        if (min === "" || max === "") {
            DisplayMessage("Minimum or maximum is invalid.", "red");
            return false;
        }
        try {
            if (Number(max) > Number(min)) {
                return true
            } else {
                DisplayMessage("Invalid range. Minimum amount cannot be greater than the maximum amount.", "red");
                return false;
            }
        } catch (error) {

        }

    }

    const CreateAd = async () => {

        const currency = document.getElementById("currency").value
        const min = document.getElementById("min").value
        const max = document.getElementById("max").value
        const rates = document.getElementById("rates").value
        // console.log(currency, Ads);

        // check existing
        const existing = Ads.filter(item => item.currency === currency && item.is_active);
        if (existing.length > 0) {
            DisplayMessage("Archive your active " + (currency === "1" ? "USD" : "") + (currency === "2" ? "CNY" : "") + (currency === "3" ? "EUR" : "") + " to continue.", "red");
            return;
        }
        else {
            if (!CheckField()) {
                return;
            };
            if (!document.getElementById("agree").checked) {
                DisplayMessage("You must agree with our terms to continue", "red");
                return;
            }
            try {

                const resp = await fetch(globalData.BH + "/cashien/create-new-ad/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": globalData.cookie
                    },
                    body: JSON.stringify({ "min": formatNumber(min), "max": formatNumber(max), "rates": rates, "currency": currency })
                });
                const result = await resp.json();
                if (resp.status === 200) {
                    SetAds(result['data']);
                    DisplayMessage("Ad created", globalData.cusGold);
                    navigate("/my-ads");
                    return;
                } else {
                    DisplayMessage(result['msg'], "red");
                    return;
                }

            } catch {
                DisplayMessage("An unexpected error has occured", "red");
                return;
            }

        }

    }

    const DeleteAd = async (adId, isActive) => {
        SetLoaderHeight("0.5vh")
        SetLoader("90%");

        try {
            const resp = await fetch(globalData.BH + "/cashien/delete-ad/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": globalData.cookie
                },
                body: JSON.stringify({ "adId": adId })
            });
            const result = await resp.json();

            if (resp.status === 200) {
                if (isActive) {
                    DisplayMessage("Ad has been archived. Delete ad from inactive to permanently delete.", "red");
                }
                else {
                    DisplayMessage("Your Ad has been permanently deleted.", "red");
                }
                SetAds(result['msg']);
                SetLoaderHeight("0vh");
                SetLoader("0%");

            }
            else {
                console.log("jere")
                DisplayMessage("Failed to delete ad.", "red");
                setTimeout(() => {
                    SetLoaderHeight("0vh");
                    SetLoader("0%");
                }, 1000);

            }
        }
        catch {
            DisplayMessage("Failed to delete ad.", "red");
            SetLoaderHeight("0vh");
            SetLoader("0%");
        }

    }

    const Format = (inputId) => {
        const box = document.getElementById(inputId);
        const final = formatNumber(box.value);
        box.value = addComma(final);
    }

    const FormatRates = () => {
        const rates = document.getElementById("rates");
        const fmtFloat = parseFloat(rates.value);
        console.log(fmtFloat)
        rates.value = fmtFloat.toString().substring(0, 4);
    }

    const Reactivate = async (adId) => {
        try {
            const resp = await fetch(globalData.BH + "/cashien/reactivate-ad/", {
                method: "POST",
                headers: {
                    "Authorization": globalData.cookie,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "adId": adId })
            });
            const result = await resp.json();
            if (resp.status === 200) {
                SetAds(result['ads']);
                DisplayMessage("Ad reactivated.", globalData.cusGold);
                return;
            } else if (resp.status === 301) {
                DisplayMessage(result['msg'], "red");
                return
            } else {
                DisplayMessage(result['msg'], "red");
                return;
            }
        }
        catch {
            DisplayMessage("An unexpected error has occured.", "red");
            return;
        }

    }



    // Rendering Function

    const Active = () => {
        useEffect(() => {
            SetIsActive("active");
        }, []);

        return (
            <div style={{}}>
                {
                    Ads === null
                        ?
                        <Activity />
                        :
                        <CusAds params={{ "is_active": true }} />
                }
            </div>
        )
    }


    const CusAds = ({ params }) => {
        console.log(params)
        console.log(Ads.filter(item => item.is_active === params.is_active))


        return (
            <div style={{ minHeight: "90vh", overflowX: "hidden" }}>
                {
                    Ads !== null &&
                    (
                        Ads.filter(item => item.is_active === params.is_active).length === 0 ?
                            (
                                <div className="Center Horizontally Vertically" style={{ minHeight: "50vh" }}>
                                    {
                                        params.is_active === true ?
                                            <p style={{ fontSize: "2em", textAlign: "center" }}>
                                                No ads found. Would you like to
                                                &nbsp;<Link to="/my-ads/create-new">
                                                    create
                                                </Link>&nbsp;
                                                one?
                                            </p>
                                            :

                                            <p style={{ fontSize: "2em", textAlign: "center" }}>
                                                Your archived ads would move here.
                                            </p>
                                    }
                                </div>
                            )
                            :
                            Ads.filter(item => item.is_active === params.is_active).map((item, index) =>
                                <div key={index}>
                                    <SingleCusAd params={{ "Ad": item }} />
                                </div>
                            ))
                }
            </div>
        )
    }



    const CreateNewAd = () => {
        useEffect(() => {
            SetIsActive("new");
        }, []);
        return (
            <div style={{ padding: "0vh 2vh", minHeight: "90vh", marginTop: "5vh" }} >
                <div style={{ background: globalData.cusBlack, border: "1px solid " + globalData.cusGold, padding: "1vh" }}>
                    <div>

                        <div style={{ display: "grid", gridTemplateColumns: "50% 50%", gap: "2vw" }}>
                            <div>
                                <div>

                                    <span>
                                        Minimum(USDT):
                                    </span>
                                </div>
                                <input className="dark" id="min" onChange={() => {
                                    Format("min")
                                }} />
                            </div>
                            <div>
                                <div>

                                    <span>
                                        Maximum(USDT):
                                    </span>
                                </div>
                                <input className="dark" id="max" onChange={() => {
                                    Format("max")
                                }} />
                            </div>
                        </div>

                    </div>
                    <div>
                        <div>
                            <span>
                                Rates:
                            </span>
                        </div>
                        <div>
                            <input className="dark" id="rates" onBlur={FormatRates} />
                        </div>
                    </div>
                    <div>
                        <div>
                            <span>
                                Currency:
                            </span>
                        </div>
                        <div >
                            <select id="currency" className="form-select" ariaLabel="Default select example" style={{ background: "black", color: "white" }}>
                                <option selected value="1">USD</option>
                                <option value="2">CNY</option>
                                <option value="3">EUR</option>

                            </select>
                        </div>
                        <br />
                        <div style={{ display: "flex", gap: "2vw", padding: "0 2vw" }}>
                            <div>
                                <input type="checkbox" id="agree" />
                            </div>
                            <div>
                                <span>
                                    Agree to our terms.
                                </span>
                            </div>
                        </div>
                        <br />

                        <div>
                            <p className="GoldButton" onClick={CreateAd}>
                                Create Ad
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        )
    }



    const Inactive = () => {
        useEffect(() => {
            SetIsActive("inactive");
        }, []);
        return (
            <div style={{}}>
                {
                    Ads === null
                        ?
                        <Activity />
                        :
                        <CusAds params={{ "is_active": false }} />
                }
            </div>
        )
    }


    const SingleCusAd = ({ params }) => {
        const ad = params.Ad;
        console.log(ad)
        return (
            <div>
                <div style={{ display: "grid", gridTemplateColumns: "90% 10%", margin: "2vh", border: "2px solid " + globalData.cusGold, padding: "1vh 1vh", background: globalData.cusBlack }}>

                    <div>
                        <span>
                            <b>{ad.adId}</b>
                        </span>
                        <br />
                        <span>
                            Minimum: {addComma(ad.min_amount)} USDT
                        </span>
                        <br />
                        <span>
                            Maximum: {addComma(ad.max_amount)} USDT
                        </span>
                        <br />
                        <span>
                            Currency: {ad.currency === "1" && "USD"}{ad.currency === "2" && "CNY"}{ad.currency === "3" && "EUR"}
                        </span>
                        <br />
                        <span>
                            Rates: {ad.rates.toString().substring(0, 4)}
                        </span>
                    </div>

                    <div className="Center Horizontally Vertically DeleteBTN" onClick={() => {
                        DeleteAd(ad.adId, ad.is_active)
                    }}>
                        <FaTrashAlt style={{ color: "white" }} />
                    </div>

                </div>
                {
                    !ad.is_active
                    &&

                    <div className="GoldButton" onClick={() => {
                        Reactivate(ad.adId);
                    }}>
                        Activate
                    </div>
                }
            </div>
        )
    }


    useEffect(() => {
        (async function () {
            // is not logged in?
            if (globalData.user === undefined && !globalData.fetching) {
                navigate("/login/my-ads");
                return;
            }

            // retrieve data
            const resp = await fetch(globalData.BH + "/cashien/get-cus-ads", {
                method: "GET",
                headers: {
                    "Authorization": globalData.cookie,
                    "Content-Type": "application/json"
                }
            });

            const result = await resp.json();
            if (resp.status === 200) {

                SetAds(result['msg']);

            } else if (resp.status === 400) {
                DisplayMessage("Your session has expired. Sign in to continue.", "red");
                navigate("/login/my-ads");

            }
            // invalid with no explanation
            else {
                DisplayMessage("An unexpected error has occured", "red");
            }

        })();

    }, [globalData.user, globalData.BH, globalData.cookie, globalData.fetching, navigate]);

    useEffect(() => {

    }, [loaderHeight]);


    return (
        <div style={{ background: globalData.cusBlack, color: globalData.cusGray }}>
            <br /><br /><br />
            <h1>
                My Ads
            </h1>
            <div>
                <ul className="nav nav-pills nav-fill">
                    <li className="nav-item">
                        <Link to="/my-ads" className={"nav-link " + (IsActive === "active" ? " active" : "")} aria-current="page" >Active Ads</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/my-ads/inactive" className={"nav-link " + (IsActive === "inactive" ? " active" : "")} >Inactive Ads</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/my-ads/create-new" className={"nav-link " + (IsActive === "new" ? " active" : "")} >Create New</Link>
                    </li>
                </ul>
            </div>

            <div style={{ height: loaderHeight, background: "gold", width: loader, transition: "width 1s linear" }}>

            </div>

            <div style={{ padding: "0.1vmin 0.1vmin", background: "black" }}>
                <Routes>
                    <Route path="/" element={<Active />} />
                    <Route path="/create-new" element={<CreateNewAd />} />
                    <Route path="/inactive" element={<Inactive />} />
                </Routes>
            </div>
        </div>
    )
}

export default MyAds;